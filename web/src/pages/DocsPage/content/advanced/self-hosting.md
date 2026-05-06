---
title: Self-hosting
description: How to run your own 2anki.net instance
---

These instructions are written for Debian-style Linux. Adjust commands for your OS and contribute back via [github.com/2anki/web](https://github.com/2anki/web).

You will need two repositories:

- [2anki/server](https://github.com/2anki/server) — Node.js API (port `2020`)
- [2anki/web](https://github.com/2anki/web) — React frontend (Vite)

## Prerequisites

- **Node.js** — the version pinned in each repo's `.nvmrc` / `package.json` (`packageManager` field)
- **pnpm** — the package manager for both repos (don't use npm or yarn)
- **PostgreSQL** — any recent version; you will need a database and a user with create-table privileges
- **LibreOffice** — required by the server to convert PPT/PPTX to PDF
- **Poppler** (`pdftoppm`) — required to convert PDF pages to images

```bash
sudo apt-get install -y git postgresql libreoffice poppler-utils
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
# restart your shell, then:
nvm install --lts
npm install -g pnpm
```

## Clone the repositories

```bash
mkdir -pv ~/src/github.com/2anki
cd ~/src/github.com/2anki
git clone https://github.com/2anki/server
git clone https://github.com/2anki/web
```

## Database

Create a database and user, then export a connection string. Example:

```bash
sudo -u postgres psql -c "CREATE USER tanki WITH PASSWORD 'tanki';"
sudo -u postgres psql -c "CREATE DATABASE tanki OWNER tanki;"
```

## Server configuration

Create `server/.env`. Minimum variables:

```bash
PORT=2020
WORKSPACE_BASE=/tmp/genanki
UPLOAD_BASE=/tmp/genanki-uploads
WEB_BUILD_DIR=../web/build
RUN_MIGRATIONS=true

POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=tanki
POSTGRES_PASSWORD=tanki
POSTGRES_DATABASE=tanki
```

Optional integrations:

- `NOTION_CLIENT_ID`, `NOTION_CLIENT_SECRET`, `NOTION_REDIRECT_URI` — enables the Notion OAuth flow
- `ANTHROPIC_API_KEY` — enables the Claude-based flashcard generation feature
- S3 / DigitalOcean Spaces variables — enables remote storage for uploads

`RUN_MIGRATIONS=true` applies the Knex migrations on boot; leave it unset in production deployments where you run migrations out of band.

## Build the frontend

```bash
cd ~/src/github.com/2anki/web
pnpm install
pnpm build
```

The build output lands in `web/build`, which the server serves via `WEB_BUILD_DIR`.

## Run the server

```bash
cd ~/src/github.com/2anki/server
pnpm install
pnpm dev
```

The server listens on `http://localhost:2020`. In development the React app can be run separately with `pnpm dev` inside `web/` — it proxies `/api` to `:2020` (see `web/vite.config.ts`).

The swagger UI is served at `/api/docs`.
