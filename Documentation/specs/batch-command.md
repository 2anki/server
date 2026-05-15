# Spec: `/batch` — worktree fan-out for mechanical work

**Outcome**: A queue of N independent mechanical tasks (Dependabot bumps, dead-code cleanups, repo-wide copy fixes) ships as N parallel PRs in the time it currently takes to manually handle one. Pilot target: triage the daily Dependabot queue (typically 5–15 PRs/day) in under 5 minutes of dispatch time, vs. the current 20–40 minutes of sequential work.
**Goal alignment**: Mechanical work is the single biggest drain on shipping time. Every minute Alexander spends approving a `patch`-level bump is a minute not spent on conversion quality, the Ankify product, or growth toward 300K. `/batch` converts that work from sequential toil into a parallel dispatch — the human role becomes "set the policy, spot-check the result," not "click merge 12 times."

## Problem

The repo gets 10–15 Dependabot PRs per week, plus the dead-code auditor periodically produces a list of 5–20 unused exports across modules. Each of these is independent — they don't share files, don't need design review, and have a deterministic verification step (`/check` + `sonar-scanner` + no behavior change). But the workflow processes them serially: one PR, wait for CI, review, merge, repeat.

The existing setup has all the primitives (subagents, worktrees, `gh`) but no command that composes them into "given a list of N tasks, dispatch N isolated workers and report back." `/batch` fills that gap.

## Scope

**In scope:**
- A new slash command `.claude/commands/batch.md` with the shape `/batch <task-type> [filter]`.
- Three built-in task types for the pilot:
  - `dependabot` — pick up open Dependabot PRs, run `/check` + verify + merge (or comment with the blocker).
  - `dead-code` — consume the latest `dead-code-auditor` report, open one PR per module that removes unused exports.
  - `copy-sweep` — given a `VOICE.md` rule and a directory, open one PR per page/component that fixes violations.
- A dispatcher that creates one `EnterWorktree` per task (capped at `MAX_CONCURRENT`, default 4), assigns a forked agent to each, and aggregates results.
- A summary table at the end: `task → branch → PR# → status (merged | open | failed-checks | needs-review)`.
- A `--dry-run` flag that lists what would be dispatched without actually creating worktrees or PRs.

**Out of scope:**
- Generic LLM-decides-what-to-do batch ("refactor the codebase"). The command takes a typed task with a deterministic verification step. Open-ended refactors stay with the trio.
- Cross-PR dependencies. Every dispatched task must be independent. If task B depends on task A landing first, `/batch` is the wrong tool.
- Replacing `/review-pr`. `/review-pr` is parallelism *within* one PR; `/batch` is parallelism *across* PRs.
- Auto-merge to `main` for anything that isn't a `patch`-level Dependabot bump. Everything else opens a PR and stops.
- Background daemon mode. `/batch` is a foreground command — Alexander runs it, watches the table fill in, decides what to do with anything that fell out as `needs-review`.

## User story

As the sole maintainer, I want to clear the daily Dependabot queue in one command — letting me see a final table of "12 merged, 1 needs-review (Stripe SDK major bump)" — so that I never spend a morning clicking merge.

## Command behavior

```
/batch dependabot              # all open Dependabot PRs
/batch dependabot --patch-only # skip minor/major bumps
/batch dependabot --dry-run    # list what would dispatch
/batch dead-code               # consume latest auditor report
/batch copy-sweep web/src/pages/AccountPage  # one directory
```

### Dispatch loop

1. **Plan.** Build the task list (Dependabot PRs, auditor findings, file list). Cap at `MAX_TASKS` (default 20) — if more, prompt to confirm.
2. **Dispatch.** For each task up to `MAX_CONCURRENT` (default 4):
   - `EnterWorktree` off `origin/main`
   - Fork an agent with a typed prompt (one per task type) that owns its worktree
   - The fork: checks out / cherry-picks, runs `/check`, verifies the change, opens a PR (or merges if eligible), exits
3. **Drain.** As each fork completes, dispatch the next pending task. Print a one-line status update per completion.
4. **Report.** Final table with PR#, branch, status, and a one-line reason for any failures.

### Per-task-type prompts

Stored alongside `batch.md` as `.claude/commands/batch-tasks/<type>.md`. Each one specifies:
- Inputs the fork receives (PR#, file path, etc.)
- The verification step (`/check`, `sonar-scanner` on `dead-code`, etc.)
- The success action (merge | open PR | comment-and-stop)
- The "fail safe" action — what to do if verification fails (always: comment with the blocker, leave the PR open, exit with `needs-review`)

### Hard limits

- `MAX_CONCURRENT = 4` — more than 4 worktrees of this repo eats local disk + slot contention with the orchestrator's own session
- `MAX_TASKS = 20` per invocation — anything larger means the queue is wrong, not that we should dispatch 40 workers
- `TIMEOUT_PER_TASK = 10 min` — a fork that doesn't return in 10 min is killed and reported as `timeout`
- **Never** dispatch a task that touches `auth`, `payments`, or any path under `src/services/StripeService` / `src/services/AuthenticationService` / `src/lib/Token.ts` — those route to `/security-review` instead, with a clear error

## What `/batch` does NOT do

- Decide whether a task is worth doing. The queue is the input.
- Negotiate merge conflicts between dispatched PRs. Each task is independent or the dispatcher rejects it up front.
- Run when there's an active feature branch with uncommitted work. The pilot's first version refuses to start in that state — the worktree-isolation invariant breaks if the orchestrator's main checkout is dirty.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| 20 worker agents each running `pnpm install` saturates the laptop | `MAX_CONCURRENT = 4` + reuse the pnpm store between worktrees |
| A failing fork leaves a worktree behind | The dispatcher tracks worktree IDs and runs `ExitWorktree` in a deferred cleanup pass on its own exit |
| Auto-merge ships something broken | `dependabot` task type auto-merges only `patch`-level updates; everything else stops at "open PR + comment" |
| The deploy pipeline runs N times back-to-back | Existing `concurrency: cancel-in-progress: true` on the deploy workflow already handles this — superseded deploys cancel themselves |
| One worker corrupts another's state | Worktrees enforce filesystem isolation; the dispatcher never edits files itself |

## Pilot plan

1. Ship `batch.md` + `batch-tasks/dependabot.md` only. Other task types deferred.
2. Pilot on a single morning's Dependabot queue. Compare time-to-clear against the prior week's manual baseline.
3. If the pilot saves >50% wall-clock with zero broken merges, add `dead-code` and `copy-sweep`.
4. If the pilot produces a `needs-review` rate above 30%, the prompt is wrong — iterate before adding more task types.

## Open questions

- Does the dispatcher need a way to *resume* a partial batch if the orchestrator session dies mid-run? Probably yes for `dependabot` (PRs are durable, branch names are too) but it adds complexity. Defer to v2 unless the pilot says otherwise.
- Should `/batch` post a single GitHub status comment summarizing the dispatch across all PRs? Nice-to-have; not required for v1.
