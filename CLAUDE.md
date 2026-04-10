# CLAUDE.md

## Git

Use conventional commit prefixes for all commits (e.g. fix:, feat:, chore:, refactor:, test:, docs:).

## General

Ask me before trying to start the server.

Keep code simple and readable. Don't remove duplication too early. Don't over-optimize for code that is "convenient" to change — we want it to be simple to understand.

Do not add comments. Use meaningful names for variables and functions instead.

After completing a request, check if any extra unnecessary code has been added, and remove it.

## Commands

Use `npm run test` scoped to the current test file. If test output is truncated, rerun without coverage for full output. When tests fail, provide the specific error message.

## Process

Use TDD: write a failing test, verify it fails for the expected reason with a clear error message, pass it in the simplest way, then refactor. Prefer outside-in testing. If asked to implement without a test, ask if it should be tested.

## Architecture

Handlers deal with HTTP requests or event logic, not business logic. Commands deal with business logic and should not directly access the database.

## Security

Always use parameterized queries with Knex — never use `knex.raw()` with string concatenation. Validate and sanitize all user input at the handler level. Never log sensitive data (passwords, tokens, personal information). Use `res.locals` for passing authenticated user data through middleware.
