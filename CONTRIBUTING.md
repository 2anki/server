# Contributing

Your contributions are welcome! Whether this is your first open-source PR, you're a vibe coder using AI tools, or you've been shipping open source for years — you're welcome here.

## Where to start

Not sure where to jump in? These are great places to begin:

- [Good first issues](https://github.com/2anki/server/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) — smaller, well-scoped tasks
- [Help wanted](https://github.com/2anki/server/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22) — things we could really use a hand with

## Stack at a glance

Node 22 (TypeScript), Express 5, Knex + PostgreSQL (SQLite for local dev), Jest, PM2 in production. The frontend is React + Vite. Package manager is **pnpm**.

## Before you push

Run the full gate locally:

```bash
pnpm build          # server typecheck
pnpm test           # Jest tests (scope with pnpm test <path>)

# from web/
pnpm typecheck      # frontend typecheck
pnpm lint           # Biome lint
pnpm test:run       # Vitest tests
```

## Review turnaround

We try to review PRs within a few hours during active periods. Keeping each PR focused on one logical change makes it easier to review and faster to merge — and we really appreciate that.

## AI-assisted contributions

We're happy to receive AI-assisted contributions (Copilot, Claude, Cursor, etc.) — just mention it in the PR body so reviewers know what to look for. The same quality bar applies regardless of how the code was written:

- All commands above must pass before submission
- One logical change per PR — avoid bundling unrelated refactors
- Test new behaviour; don't rely on AI-generated code being correct without verification

## Other ways to contribute

- Make a video in your native language showing people how to use 2anki
- Write about 2anki on your blog
- If you are missing a feature or format, [open an issue](https://github.com/2anki/server/issues)

If you run into trouble or have questions, open an issue — we're glad to help.
