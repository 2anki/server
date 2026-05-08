# CLAUDE.md

Express/TypeScript server that converts Notion pages and file uploads into Anki flashcard decks (.apkg).

## Git

- Use conventional commit prefixes (e.g. fix:, feat:, chore:, refactor:, test:, docs:)
- Suggest a branch name before starting any code changes
- Always rebase on origin/main before creating a new branch or opening a PR

## General

- Ask before starting the server
- Prefer simple and obvious — do not deduplicate until a pattern has appeared at least three times
- Do not add comments — use meaningful names instead
- Before considering a task done, remove any scaffolding, debug logs, or temporary code added during implementation
- Lead with the positive condition when an `if` has an `else`: write `if (ready) { … } else { … }`, not `if (!ready) { … } else { … }`. Negation + else forces the reader to mentally invert the first branch (Sonar S7735)

## Commands

- Run tests with `pnpm test` scoped to the current test file
- If test output is truncated, rerun without coverage for full output
- When tests fail, provide the specific error message

## Working speed

- For research that spans 3+ queries (where is X defined, what touches Y, what changed in Z), spawn a subagent via the Agent tool with `subagent_type=Explore`. If the result isn't immediately needed, run it with `run_in_background: true` and keep editing in parallel.
- For risky changes (auth flow, payments, migrations, deploy pipeline, anything that scares you), use `EnterWorktree` to isolate. Reverting a worktree is free.
- For "wait until X" — long builds, CI runs, deploys baking on prod — use `ScheduleWakeup` (270s if cache-warm matters, 1200s+ for genuine waits). Never busy-poll with sleep.
- Before running `gh pr merge` on a PR that touches auth, payments, or external-API integration code, run `/security-review` first.
- After deploys to 2anki.net, run `/deploy-status` to confirm the box is healthy before declaring success.
- If you notice yourself approving the same read-only Bash commands more than 2-3 times in a session, suggest the user run `/fewer-permission-prompts` to top up the allowlist.

## Process

- Use TDD by default: write a failing test, verify it fails for the right reason, pass it in the simplest way, then refactor. If asked to implement without a test, confirm whether to skip it.
- Prefer outside-in testing
- Only mock external dependencies (HTTP calls, third-party APIs, email) — not internal services
- A passing test suite is not proof of correctness — before committing, review affected user flows in the codebase to check for regressions

## Architecture

Request path: `routes/` → `controllers/` → `usecases/` → `services/` → `data_layer/` (DB).
Each layer has a CLAUDE.md with its own rules.

## Security

- IMPORTANT: Use `== null` to check for absent values — not `!value`, which incorrectly rejects falsy IDs like `0`
- Never use `knex.raw()` with string concatenation — always use parameterized queries
- Validate and sanitize all user input at the handler level
- Never log sensitive data (passwords, tokens, personal information)
- Use `res.locals` for passing authenticated user data through middleware

## Goal

**Mission**: give people the simplest, fastest way to turn what they're studying into beautiful Anki flashcards. Every interaction should feel obvious and quick — drop something in, get a clean deck back.

**Scale**: grow 2anki.net to over 300K users.

Every PR and roadmap decision should be checked against both: does it make the experience simpler / faster / more beautiful for the user, and does it move us toward that scale?

## The trio

Three sub-agents live in `.claude/agents/`:

- **engineer** — implements specs, reviews PRs, writes tests, ships
- **designer** — UI/UX decisions, copy, visual consistency
- **pm** — feedback synthesis, prioritization, spec writing, metrics

Default workflow: `pm` produces a spec → `designer` validates UX (only if user-facing) → `engineer` implements → `engineer` opens and reviews the PR. For tiny fixes, skip directly to engineer.

Conventions for the trio:

- Be opinionated. Don't list five options — recommend one with reasoning.
- Specs are short. If a spec runs longer than one page, split it.
- Say what *not* to build. Scope discipline beats feature creep.
- Reply to support email *as a draft for Alexander to send*, not as Claude.

## Trio slash commands (`.claude/commands/`)

- `/triage-feedback` — paste raw email/Discord/survey → themed summary + drafted GitHub issues
- `/spec <issue-url>` — turn a GitHub issue into a one-page implementation spec
- `/implement <spec>` — spec → branch + commits + PR
- `/review-pr <pr-url>` — review a contributor PR against conventions and goal alignment
- `/changelog [date range]` — recent merged PRs → user-facing changelog entry
- `/weekly-retro` — Stripe + Plausible numbers → priority adjustments
- `/support-reply` — paste a user email → a draft reply in Alexander's voice
