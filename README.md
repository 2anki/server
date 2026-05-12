# 2anki.net

[2anki.net](https://2anki.net) helps you turn your Notion pages, HTML, Markdown, and other study material into Anki flashcards. Drop something in, get a clean `.apkg` deck back — no fuss. We love Anki and Notion and want to make them work better together.

This is a monorepo: the Express server lives at the root and the React frontend lives under `web/`.

## Contributing

We'd love your help! Whether this is your first open-source PR, you're a vibe coder using AI tools, or you've been shipping open source for years — you're welcome here. See [CONTRIBUTING.md](./CONTRIBUTING.md) for general guidelines.

### Where to start

Not sure where to jump in? These are great places to begin:

- [Good first issues](https://github.com/2anki/server/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) — smaller, well-scoped tasks
- [Help wanted](https://github.com/2anki/server/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22) — things we could really use a hand with

### Before you push

Run the full gate locally:

```bash
pnpm build          # server typecheck
pnpm test           # Jest tests (scope with pnpm test <path>)

# from web/
pnpm typecheck      # frontend typecheck
pnpm lint           # Biome lint
pnpm test:run       # Vitest tests
```

### Review turnaround

We try to review PRs within a few hours during active periods. Keeping each PR focused on one logical change makes it easier to review and faster to merge — and we really appreciate that.

### AI-assisted contributions

We're happy to receive AI-assisted contributions (Copilot, Claude, Cursor, etc.) — just mention it in the PR body so reviewers know what to look for. The same quality bar applies regardless of how the code was written:

- All commands above must pass before submission
- One logical change per PR — avoid bundling unrelated refactors
- Test new behaviour; don't rely on AI-generated code being correct without verification

If you run into trouble or have questions, open an issue — we're glad to help.

## Why 2anki?

We're not replacing Anki or Notion — we're building a bridge between them. Drop in what you're studying, get a deck back.

- Free to use, no technical skills required
- Multi-format: Notion pages (via API or HTML export), Markdown, HTML, Excel (xlsx), zip bundles
- Toggle lists become cards, cloze deletions work out of the box
- Embeds, audio, images, code blocks, and LaTeX carried over
- Self-hostable if you hit the free-tier quota
- No VC funding — sustained by paying subscribers and lifetime users

## How it works

Top-level [toggle lists][tl] become Anki flashcards: the toggle line is the front, everything inside is the back. [Cloze deletions](https://docs.ankiweb.net/#/editing?id=cloze-deletion) are enabled by default. You can also flip cards (basic, reversed, or both) via card-type options.

For a walkthrough, see [How to use cloze deletions](https://youtu.be/r9pPNl8Mx_Q) by [Alp Kaan](https://alpkaanaksu.com/).

## Background

Started in 2020 after [a Reddit post](https://www.reddit.com/r/Anki/comments/g29mzk/cards_imported_from_notion/) asked for a painless way to turn Notion toggle lists into Anki cards. The project grew from there.

## Getting started

```bash
git clone https://github.com/2anki/server.git
cd server
pnpm install

# Create a .env file (the server runs with defaults for local dev,
# but the dev:server script reads from .env via --env-file)
touch .env

# Run both server and frontend
pnpm dev
```

The server starts on `http://localhost:2020` and the frontend on `http://localhost:5173`.

For server-only work: `pnpm dev:server`.

## Stack at a glance

Node 22 (TypeScript), Express 5, Knex + PostgreSQL (SQLite for local dev), Jest, PM2 in production. The frontend is React + Vite. Package manager is **pnpm**.

## Star History

<a href="https://star-history.com/#2anki/server&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=2anki/server&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=2anki/server&type=Date" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=2anki/server&type=Date" />
  </picture>
</a>

## Credits

Special thanks to the following contributors

<table>
    <tr>
        <td align="center">
            <a href="https://alemayhu.com">
                <img src="https://avatars1.githubusercontent.com/u/925044?s=460&u=3bbe382e30dac01219f2423abcb7f6c1a47b9b5a&v=4" width="100px;" alt=""/>
                <br /><sub>
                <b>Alexander Alemayhu</b>
                </sub></a><br />
                <a href="https://github.com/2anki/server/commits?author=aalemayhu" title="Code">💻</a>
                <a href="https://github.com/2anki/server/pulls?q=is%3Apr+reviewed-by%3Aaalemayhu" title="Reviewed Pull Requests">👀</a>
                <a href="https://github.com/2anki/server/commits?author=aalemayhu" title="Documentation">📖</a>
                <a href="https://www.youtube.com/channel/UCVuQ9KPLbb3bfhm-ZYsq-bQ" title="Videos">📹</a>
        </td>
        <td align="center">
            <a href="https://alpkaanaksu.com">
                <img src="https://avatars0.githubusercontent.com/u/68744864?s=460&u=14e5b70a520bf800b4ed942640b9f825bb3d997b&v=4" width="100px;" alt=""/>
                <br /><sub>
                <b>Alp Kaan Aksu</b>
                </sub></a><br />
                <a href="https://github.com/2anki/server/commits?author=alpkaanaksu" title="Code">💻</a>
                <a href="https://www.youtube.com/channel/UCVuQ9KPLbb3bfhm-ZYsq-bQ" title="Videos">📹</a>
        </td>
        <td align="center">
            <a href="https://github.com/Mobilpadde">
                <img src="https://avatars2.githubusercontent.com/u/1170567?s=460&u=7fffacd722d6f39535f1b71a25e6b853a7451d80&v=4" width="100px;" alt=""/>
                <br /><sub>
                <b>Mads Cordes</b>
                </sub></a><br />
                <a href="https://github.com/2anki/server/commits?author=mobilpadde" title="Code">💻</a>
        </td>
        <td align="center">
            <a href="https://www.guillempalausalva.com/">
                <img src="https://avatars2.githubusercontent.com/u/8341295?s=460&u=14d22c0bb0bab69ac305b38ac6533158ad4ce8b3&v=4" width="100px;" alt=""/>
                <br /><sub>
                <b>Guillem Palau-Salvà</b>
                </sub></a><br />
                <span title="Answering Questions">💬</span>
                <span title="Ideas & Planning">🤔</span>
        </td>
        <td align="center">
            <a href="https://nyasaki.dev/">
                <img src="https://avatars1.githubusercontent.com/u/23500970?s=460&u=9d1f3847e7e960e436051b8d6e39885cf650d841&v=4" width="100px;" alt=""/>
                <br /><sub>
                <b>Marcel Walk</b>
                </sub></a><br />
                <span title="Tests">⚠</span>
                <a href="https://github.com/2anki/server/commits?author=MarcelWalk" title="Code">💻</a>
        </td>
    </tr>
</table>

## License

Unless otherwise specified in the source:

The code is licensed under the [MIT](./LICENSE) Copyright (c) 2020-2026, [Alexander Alemayhu][1]

[1]: https://alemayhu.com
[tl]: https://www.notion.so/Toggles-c720af26b4bd4789b736c140b2dc73fe
