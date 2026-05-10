---
title: Self-hosting
description: You can run 2anki yourself. Here's the short version.
---

:::note
Self-hosting is for tinkerers and contributors. Almost everyone is better off using the hosted service at [2anki.net](https://2anki.net/) — same code, no setup, free for the conversion features.
:::

The codebase lives in [2anki/server](https://github.com/2anki/server) — a pnpm monorepo with the Express API and the React frontend (the `web/` workspace, package name `2anki-web`). Free to run for personal or commercial use.

**Plan:** Free (self-hosted; the [hosted-service tiers](/pricing) don't apply when you run your own instance)

## System requirements

- Node.js — match the version in `.nvmrc`.
- pnpm — don't use npm or yarn.
- PostgreSQL.
- LibreOffice — for PPT/PPTX to PDF conversion.
- Poppler (`pdftoppm`) — for PDF page rendering.

On Debian/Ubuntu:

```bash
sudo apt-get install -y git postgresql libreoffice poppler-utils
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install --lts
npm install -g pnpm
```

## Required env vars

Create `.env` at the repo root:

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

SECRET=replace-with-a-long-random-string
```

`SECRET` is used to sign session cookies. Set it to a long random value before exposing the server publicly. Set `RUN_MIGRATIONS=true` on first boot; leave unset in production where you run migrations out of band.

## Optional integrations

Each integration adds a feature. You can run 2anki without any of them — the file-upload conversion path works on its own.

| Integration | Env vars | Adds |
|---|---|---|
| Notion OAuth | `NOTION_CLIENT_ID`, `NOTION_CLIENT_SECRET`, `NOTION_REDIRECT_URI` | Connect Notion + Find pages picker |
| Anthropic Claude | `ANTHROPIC_API_KEY` | AI flashcard generation from PDFs |
| Stripe | `STRIPE_*` | Paid plans (skip if you're running for yourself) |
| SendGrid | `SENDGRID_API_KEY` | Transactional email (password reset, etc.) |
| AWS S3 / DigitalOcean Spaces | `S3_*` | Remote upload storage instead of local disk |

## Where to get help

- The repo's [`README.md`](https://github.com/2anki/server#readme) is the source of truth for setup steps.
- Once the server is running, the API reference is at `/api/docs` (Swagger UI).
- For self-host questions, [open a discussion](https://github.com/2anki/server/discussions) on GitHub. Email is fine for hosted-service questions but the discussion forum is faster for self-hosting because other self-hosters answer.

We don't write a full ops manual on purpose — the hosted service is what most users want, and the README plus the code are enough for the tinkerers who don't.
