# MCP servers — `.mcp.json`

Three project-scoped MCP servers. None are required to use Claude Code on this repo; each one trades an extra dependency for a specific capability.

## `ide` — built-in diagnostics

Launches Claude Code's own MCP server. Surfaces TS diagnostics, file diffs, and the editor's open buffers so the model can read what you're actually staring at instead of guessing.

- **Auth:** none. Always works.
- **No `/mcp` action needed** — it auto-attaches when an IDE extension is connected.

## `github` — structured PR/issue access

Wraps the GitHub REST and GraphQL APIs so PRs, issues, and reviews come back as typed objects instead of `gh` CLI text. Useful for `/review-pr`, `/triage-feedback`, and any workflow that wants the rollup status, labels, or review thread structure.

- **Auth:** needs `GITHUB_TOKEN` in your shell env. The same token `gh` uses is fine — `export GITHUB_TOKEN=$(gh auth token)`.
- **Activation:** `/mcp` → select `github` → confirm. The server will fail to start if the env var is empty; that surfaces clearly in the `/mcp` panel.
- **Skip if** you're happy with `gh` CLI for everything; the trio commands work without it.

## `postgres` — local dev DB inspection

Read-only Postgres queries against the connection in `DATABASE_URL`. Useful for migration sanity checks, "does this column exist", and inspecting the shape of test data without spinning up a Knex query in a script.

- **Auth:** needs `DATABASE_URL` in your shell env. Point this at your **local** dev database, not production. The official MCP server is read-only by design but treat any database connection as load-bearing.
- **Activation:** `/mcp` → select `postgres` → confirm.
- **Do not** point this at the prod box. The trio's `update-config` skill or the `support-reply` workflow should never touch production data via MCP — investigate via SSH and `pm2 logs` (per `/deploy-status`) instead.

## Adding a new server

Project policy:

1. Justify the value-add over an existing tool in one sentence (in this file).
2. If it needs auth, document **how to obtain the credential** and **what scope** is required.
3. Default to read-only scopes; opt into write access only when a specific workflow needs it.
4. Never commit a token; require `${ENV_VAR}` interpolation.
