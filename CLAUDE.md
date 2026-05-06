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

## Commands

- Run tests with `pnpm test` scoped to the current test file
- If test output is truncated, rerun without coverage for full output
- When tests fail, provide the specific error message

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
