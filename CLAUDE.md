# CLAUDE.md

Express/TypeScript server that converts Notion pages and uploaded files (HTML, markdown, xlsx, zip) into Anki `.apkg` decks. Frontend is the sibling workspace under `web/`.

## Goal

Mission: give people the simplest, fastest way to turn what they're studying into beautiful Anki flashcards. Drop something in, get a clean deck back.
Scale: grow 2anki.net past 300K users.
Every PR is checked against both — does it make the experience simpler/faster/more beautiful, and does it move us toward scale?

## Tech stack

- Node 22.20.0 (`.nvmrc`), pnpm workspace, TypeScript ~6.0
- Express 5, Knex + Postgres (with `better-sqlite3` for local), multer for upload
- Jest + ts-jest, `*.test.ts` colocated next to source
- Notion (`@notionhq/client`), Anthropic, Stripe, SendGrid, AWS S3
- SonarCloud quality gate; Biome lint runs in the `web/` workspace

## Entry points

- `src/server.ts` — boots Express, wires routers, runs migrations on startup, marks interrupted Claude jobs.
- `src/routes/` → `src/controllers/` → `src/usecases/` → `src/services/` → `src/data_layer/` (DB).
  Each layer has its own CLAUDE.md — read it before editing.
- Hot path docs: @src/lib/parser/FEATURE.md, @src/services/NotionService/FEATURE.md, @src/services/observability/FEATURE.md, @src/lib/ankify/FEATURE.md
- Deeper context: `Documentation/`, `ROADMAP.md`, `RULES.md`.

## Run it

- Install: `pnpm install` (never `npm`/`yarn`).
- **Ask before starting the server.** Dev: `pnpm dev` (server + web). Server only: `pnpm dev:server`.
- Tests: `pnpm test <path>` to scope to one file. If output is truncated, rerun without coverage.
- All-green gate: `/check` (parallel server tsc + web typecheck + web vitest + web lint).
- Migrations: regenerate types after a new migration with `pnpm kanel`.
- Production deploys via the `deploy.2anki.net.yml` workflow; verify with `/deploy-status` after.

## Rules (loaded from .claude/rules/)

@.claude/rules/security.md
@.claude/rules/testing.md
@.claude/rules/code-quality.md
@.claude/rules/dependencies.md

## Git

- Conventional commit prefixes: `feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`, `perf:`, `ci:`, `build:`, `style:`, `revert:`.
- Suggest a branch name before starting code changes; format `<type>/<short-slug>`.
- Always rebase on `origin/main` before opening a PR.
- One PR per feature. Never stack PRs — the deploy pipeline pulls a single branch.
- Push pattern: `git push -u origin <branch>` — never bare `git push`, never to `main`. The `safety.py` hook blocks both.
- When a unit of work is done, ship it: commit, push, open a draft PR with `gh pr create --draft`.
- Before `gh pr merge`: every `statusCheckRollup` entry must be non-FAILURE (not just required ones). The `check-merge-status.py` hook enforces this.
- Touching auth, payments, or external-API integration? Run `/security-review` before merge.
- Document scope/follow-ups in commit bodies, not new GitHub issues.

## Working speed

- For research spanning 3+ queries (where is X defined, what touches Y), spawn `Agent(subagent_type=Explore)`. If the result isn't immediately needed, run it with `run_in_background: true` and keep editing.
- For risky changes (auth, payments, migrations, deploy pipeline), use `EnterWorktree` — reverting a worktree is free.
- For "wait until X" (long builds, CI, deploys baking on prod), use `ScheduleWakeup` (270s if cache-warm matters, 1200s+ for genuine waits). Never busy-poll with sleep.
- After deploys to 2anki.net, run `/deploy-status` to confirm the box is healthy.
- If you keep approving the same read-only Bash commands, suggest `/fewer-permission-prompts`.

## Process

- TDD by default: failing test → verify it fails for the right reason → simplest pass → refactor. If asked to skip tests, confirm first.
- Outside-in testing. Mock only external dependencies (HTTP, third-party APIs, email) — never internal services.
- A passing suite is not proof of correctness — review affected user flows for regressions before committing.
- Before declaring a task done, strip scaffolding, debug logs, and temporary code added during implementation.

## Gotchas

- **Stripe sync is manual only** — never put `updateStripeSubscriptions` on a cron or `setInterval`.
- **Never edit `src/data_layer/public/`** — Kanel-generated; rerun `pnpm kanel` instead.
- Lead with the positive in `if/else` (`if (ready)` not `if (!ready)`) — Sonar S7735.
- Use `value == null` to test "is the ID present?" — `!value` rejects falsy IDs like `0`.
- The Ankify feature is gated to users with `users.patreon = true` (lifetime). Use `hasAnkifyAccess` from `src/lib/ankify/access.ts`; don't reintroduce hard-coded emails.
- Notion webhook receiver in `routes/AnkifyWebhookRouter.ts` is intentionally inactive; polling at 5 min carries the story today.
- The prod box checks out this repo at `/home/alemayhu/src/github.com/2anki/2anki.net` (legacy name).

## The trio

Three sub-agents in `.claude/agents/`:

- **engineer** — implements specs, reviews PRs, writes tests, ships.
- **designer** — UI/UX decisions, copy, visual consistency.
- **pm** — feedback synthesis, prioritization, spec writing, metrics.

Default: `pm` produces a spec → `designer` validates UX (only if user-facing) → `engineer` implements and ships. For tiny fixes, skip to engineer. Read-only audits go through `dead-code-auditor` (haiku); isolated feature work through `test-writer` (sonnet, worktree).

Trio conventions: be opinionated (one recommendation, not five options); specs fit on one page; say what *not* to build; reply to support email *as a draft for Alexander to send*.

## Trio review policy

For any task that changes user-facing behavior, invoke `pm`, `designer`, and `engineer` subagents **in parallel** via the Agent tool before writing code. Synthesize their input, surface any conflict explicitly, then proceed.

**Trio required:**
- New features or changes to existing features
- UI/UX changes, copy that users see
- Pricing, limits, quotas, or API surface changes
- Onboarding, signup, payment, or core conversion flows
- Refactors that change user-visible behavior

**Trio optional (proceed unless you sense a product question):**
- Pure refactors with no behavior change
- Test fixes, CI/build issues
- Dependency bumps, internal-only tooling
- Documentation that isn't user-facing

**Synthesis format** (produce this before acting on any trio task):
- What each agent said (one line each)
- Where they agree
- Where they conflict, and how the conflict was resolved
- The resulting plan

Use `/trio <task>` to force a trio review on any prompt regardless of the heuristic. See `.claude/commands/trio.md`.

## Slash commands (`.claude/commands/` and `.claude/skills/`)

- `/trio` — force a trio review on any task.
- `/triage-feedback`, `/spec`, `/implement`, `/review-pr`, `/changelog`, `/weekly-retro`, `/support-reply` — trio workflow.
- `/check`, `/pr-checks`, `/deploy-status` — local + remote status.
- `/tdd`, `/add-tests`, `/security-audit`, `/verify-completion`, `/simplify`, `/systematic-debugging`, `/revise-claude-md` — engineering aids.
