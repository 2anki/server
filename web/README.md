Frontend code for [2anki.net](https://2anki.net). Lives inside the [2anki/server](https://github.com/2anki/server) monorepo as a pnpm workspace package.

<p align="center"><img width="256" src="public/mascot/Notion%201.png?raw=true" alt="Notion to Anki logo" /></p>

[![Netlify Status](https://api.netlify.com/api/v1/badges/01f911af-8a9d-48b9-aced-b41e6d7c5ab3/deploy-status)](https://app.netlify.com/sites/2anki-web/deploys)

## Local development

From the repo root (one directory up):

```bash
pnpm install          # installs server + web deps
pnpm dev              # starts the express server (:2020) and vite (:3000) in parallel
```

Or web only:

```bash
pnpm dev:web                        # from root
pnpm --filter 2anki-web dev         # equivalent
pnpm dev                            # from inside web/
```

A `web/.env` is required — vite loads it for `REACT_APP_*` substitution. If `localhost:3000` renders blank with `process is not defined` in the console, the `.env` is missing or doesn't define a referenced `REACT_APP_*` var (declare it as empty if unused, e.g. `REACT_APP_LOCALHOST=`).

The vite dev server proxies `/api` to `http://localhost:2020`, so the express server in the same monorepo handles API calls.

## License

The code is licensed under [MIT](./LICENSE.md) Copyright (c) 2020-2022, [Alexander Alemayhu](https://alemayhu.com).
