---
title: Self-hosting
description: You can run 2anki yourself. Here's the short version.
---

The codebase lives in [2anki/server](https://github.com/2anki/server) — a pnpm monorepo that contains the Express API and the React frontend (the latter is the `web/` workspace, package name `2anki-web`). It's free to self-host for personal or commercial use.

## System requirements

- Node.js — the version pinned in the repo's `.nvmrc` / `packageManager` field.
- pnpm — don't use npm or yarn.
- PostgreSQL.
- LibreOffice — for PPT/PPTX → PDF conversion.
- Poppler (`pdftoppm`) — for PDF → image rendering.

```bash
sudo apt-get install -y git postgresql libreoffice poppler-utils
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install --lts
npm install -g pnpm
```

## Required env vars

Create `.env` at the repo root with:

```bash
PORT=2020
WORKSPACE_BASE=/tmp/genanki
UPLOAD_BASE=/tmp/genanki-uploads
WEB_BUILD_DIR=./web/build
RUN_MIGRATIONS=true

POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=tanki
POSTGRES_PASSWORD=tanki
POSTGRES_DATABASE=tanki
```

Set `RUN_MIGRATIONS=true` on first boot. Leave it unset in production where you run migrations out of band.

## Optional integrations

- **Notion OAuth** — `NOTION_CLIENT_ID`, `NOTION_CLIENT_SECRET`, `NOTION_REDIRECT_URI` enable the Connect Notion flow.
- **Anthropic Claude** — `ANTHROPIC_API_KEY` enables the Claude AI flashcard option.
- **Google Vertex AI** — credentials for the experimental PDF-questions option.
- **Stripe** — for paid plans, if you want them.
- **SendGrid** — for transactional email.
- **S3 / DigitalOcean Spaces** — remote storage for uploads.
- **Bugsnag** — error reporting.

## Where to get help

A fuller setup guide is being written — track it in [issue #2073](https://github.com/2anki/server/issues/2073). For now, the repo `README.md` is the source of truth, and the Swagger UI is at `/api/docs` once the server is running.
