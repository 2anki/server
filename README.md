# 2anki.net

[2anki.net](https://2anki.net) converts Notion pages, HTML, Markdown, and other formats into Anki flashcards. Drop something in, get a clean `.apkg` deck back. The project serves 300 000+ users and is a complement to Anki and Notion — not a replacement for either.

This is a monorepo: the Express server lives at the root and the React frontend lives under `web/`.

## Stack at a glance

Node 22 (TypeScript), Express 5, Knex + PostgreSQL (SQLite for local dev), Jest, PM2 in production. The frontend is React + Vite. Package manager is **pnpm**.

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

## Contributing

Contributions are welcome — whether you are a first-time contributor, a vibe coder using AI tools, or a seasoned open-source veteran. See [CONTRIBUTING.md](./CONTRIBUTING.md) for general guidelines.

### Where to start

- [Good first issues](https://github.com/2anki/server/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)
- [Help wanted](https://github.com/2anki/server/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22)

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

PRs are typically reviewed within a few hours during active periods. Keep each PR focused on one logical change — it is easier to review and faster to merge.

### AI-assisted contributions

We welcome AI-assisted contributions (Copilot, Claude, Cursor, etc.). If you used AI tooling, please disclose it in the PR body so reviewers know what to look for. The same quality bar applies regardless of how the code was written:

- All commands above must pass before submission
- One logical change per PR — avoid bundling unrelated refactors
- Test new behaviour; don't rely on AI-generated code being correct without verification

## Strategy

<p align="center">  
  <a href="http://www.youtube.com/watch?v=oMg70YIqRsw">
    <img src="http://img.youtube.com/vi/oMg70YIqRsw/0.jpg" alt="My Thoughts on The Future of Anki Collaborative Deck Creation">
  </a>
  </img>

## What We Are Not

If you are looking for a Anki or Notion replacement then this project is probably not right for you. Watch this video [Notion + Anki](https://youtu.be/FjifJG4FoXY) to understand the project's goal. **We are never going to compete against Anki in this project**. We are building bridges 🌁

When that is said, if you are not content with Anki, you might want to checkout [SuperMemo](https://www.super-memory.com/).

## Benefits

- No technical skills required and free to use by anyone anywhere 🤗 \*
- You can convert your Notion [toggle lists][tl] to Anki cards easily.
- Support for embeds, audio files, images and more.

<sub><sup>\* Please note that due to server costs, there are quota limits in place but you can workaround this and self-host</sup><sub>

## 🎁 Support the Project

> This project is brought to you by our amazing [patrons](https://patreon.com/alemayhu)
> and [GitHub sponsors](https://github.com/sponsors/alemayhu) 🤩 Thank you!

[![Patreon](https://github.com/aalemayhu/aalemayhu/raw/master/assets/become_a_patron_button.png)](https://patreon.com/alemayhu)
[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/W7W6QZNY)
<a href="https://www.buymeacoffee.com/aalemayhu"  rel="noreferrer" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>

[![GitHub Sponsor](https://img.shields.io/badge/donate-sponsors-ea4aaa.svg?logo=github)](https://github.com/sponsors/alemayhu/)
[![Paypal](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://paypal.me/alemayhu)

You can also support the project financially and receive exclusive member benefits ✨

[tl]: https://www.notion.so/Toggles-c720af26b4bd4789b736c140b2dc73fe

## How it works

We treats toggle lists on the top level as Anki flashcards. The toggle list line is the front of the card and everything inside in the details is the back. That's the main feature but you can customize the behaviour via card options.

Considering how powerful [cloze deletions](https://docs.ankiweb.net/#/editing?id=cloze-deletion) are, they are enabled by default. To see how this works in action check out this video by [Alp Kaan](https://alpkaanaksu.com/): [How to use cloze deletions in notion2anki 🤩
](https://youtu.be/r9pPNl8Mx_Q)

You can use the card type to flip which creates a mix of the cards. Basic (front & back), basic + reversed and just reversed.

So by default we are reading in the Notion styles which does not necessarily look good on all devices. Especially on iOS you can see some weird text alignment issues. Those can be solved by adding this to your card template:

```css
body {
  padding: 1rem;
  text-align: left;
}
```

## Background

This project was hacked together after seeing this post on Reddit by [jacksong97](https://www.reddit.com/user/jacksong97):

> Hey guys just need a little help with something.
>
> I have a whole bunch of questions that I've written for myself within Notion (nested toggle questions). I was hoping I could transfer them into Anki cards fairly painlessly. I have done some just copying and pasting each side separately but it just took too long.
>
> Is there a way to import directly or copy and paste into a txt file or something that will create the cards for me?
>
> Thanks!
>
> Edit: if I were to just turn them into a text file, how do I set which text goes to the back of the card? I’ve been able to get them all into seperate cards but just the fronts

https://www.reddit.com/r/Anki/comments/g29mzk/cards_imported_from_notion/

## Limitations

We are still heavily relying on the APKG format. Long term we want to support AnkiWeb and make it possible to do true realtime collaboration.

## Star History

<a href="https://star-history.com/#2anki/2anki.net&2anki/web&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=2anki/2anki.net,2anki/web&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=2anki/2anki.net,2anki/web&type=Date" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=2anki/2anki.net,2anki/web&type=Date" />
  </picture>
</a>

## Credits

Special thanks to following developers / artistans

<table>
    <tr>
        <td align="center">
            <a href="https://alemayhu.com">
                <img src="https://avatars1.githubusercontent.com/u/925044?s=460&u=3bbe382e30dac01219f2423abcb7f6c1a47b9b5a&v=4" width="100px;" alt=""/>
                <br /><sub>
                <b>Alexander Alemayhu</b>
                </sub></a><br />
                <a href="https://github.com/alemayhu/notion2anki/commits?author=aalemayhu" title="Code">💻</a>
                <a href="https://github.com/alemayhu/notion2anki/pulls?q=is%3Apr+reviewed-by%3Aaalemayhu" title="Reviewed Pull Requests">👀</a>
                <a href="https://github.com/alemayhu/notion2anki/commits?author=aalemayhu" title="Documentation">📖</a>
                <a href="https://www.youtube.com/channel/UCVuQ9KPLbb3bfhm-ZYsq-bQ" title="Videos">📹</a>
        </td>
        <td align="center">
            <a href="https://alpkaanaksu.com">
                <img src="https://avatars0.githubusercontent.com/u/68744864?s=460&u=14e5b70a520bf800b4ed942640b9f825bb3d997b&v=4" width="100px;" alt=""/>
                <br /><sub>
                <b>Alp Kaan Aksu</b>
                </sub></a><br />
                <a href="https://github.com/alemayhu/notion2anki/commits?author=alpkaanaksu" title="Code">💻</a>
                <a href="https://www.youtube.com/channel/UCVuQ9KPLbb3bfhm-ZYsq-bQ" title="Videos">📹</a>
        </td>
        <td align="center">
            <a href="https://github.com/Mobilpadde">
                <img src="https://avatars2.githubusercontent.com/u/1170567?s=460&u=7fffacd722d6f39535f1b71a25e6b853a7451d80&v=4" width="100px;" alt=""/>
                <br /><sub>
                <b>Mads Cordes</b>
                </sub></a><br />
                <a href="https://github.com/alemayhu/notion2anki/commits?author=mobilpadde" title="Code">💻</a>
        </td>
        <td align="center">
            <a href="https://www.guillempalausalva.com/">
                <img src="https://avatars2.githubusercontent.com/u/8341295?s=460&u=14d22c0bb0bab69ac305b38ac6533158ad4ce8b3&v=4" width="100px;" alt=""/>
                <br /><sub>
                <b>Guillem Palau-Salvà</b>
                </sub></a><br />
                <a href="#questions" title="Answering Questions">💬</a>
                <a href="#ideas" title="Ideas & Planning">🤔</a>
        </td>
        <td align="center">
            <a href="https://nyasaki.dev/">
                <img src="https://avatars1.githubusercontent.com/u/23500970?s=460&u=9d1f3847e7e960e436051b8d6e39885cf650d841&v=4" width="100px;" alt=""/>
                <br /><sub>
                <b>Marcel Walk</b>
                </sub></a><br />
                <a href="#questions" title="Tests">⚠</a>
                <a href="https://github.com/alemayhu/notion2anki/commits?author=MarcelWalk" title="Code">💻</a>
        </td>
        <!-- Add Henrik (https://github.com/henrik-de), Abi, Boni when you get the necessary information -->
    </tr>
</table>

## License

Unless otherwise specified in the source:

The code is licensed under the [MIT](./LICENSE) Copyright (c) 2020-2026, [Alexander Alemayhu][1]

[1]: https://alemayhu.com
