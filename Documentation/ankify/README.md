# Ankify (in 2anki/server)

Hosted Anki + Notion ↔ Anki sync, ported from the standalone `2anki/ankify` prototype into 2anki/server proper. All routes and UI are gated behind the email allowlist defined in `src/lib/constants.ts` (`ANKIFY_ALLOWLIST_EMAILS`).

The full integration shipped on `feat/ankify-rac` (PR #2042) across seven slices. Source layout:

- `src/data_layer/ankify/` — repos: clients, sync_mappings, export_schedules, sync_logs, notion_subscriptions, sync_conflicts
- `src/services/ankify/` — RacService, AnkiConnectClient, AnkifyExportScheduler, notionPageWalker
- `src/usecases/ankify/` — orchestration: provision, list, stop, respin, send-upload, export-review-data, schedules, sync-notion-page, list/delete subscriptions, list/resolve conflicts
- `src/lib/ankify/` — pure helpers: timezone math (`nextDailyRunAt`), webhook signature verification, background job factories
- `src/routes/AnkifyRouter.ts` — `/api/ankify/*` (allowlisted)
- `src/routes/AnkifyWebhookRouter.ts` — `/api/ankify/webhook/notion` (mounted before `express.json` for raw-body access)
- `src/controllers/AnkifyController.ts` — single controller, all ankify endpoints
- `web/src/pages/AnkifyPage/` — frontend
- `web/src/pages/DownloadsPage/components/SendToAnkifyButton.tsx` — per-row dispatch on existing Downloads page

## Status notes

- [Notion webhooks: deferred](./notion-webhooks-deferred.md) — receiver code exists but is inert by design while the multi-user secret model and auto-registration flow are still pending. Polling at 5 min carries the near-realtime story today.
- [Security hardening: in progress](./security-hardening.md) — slices 1–3 landed on `feat/ankify-rac` (token-gated proxy + private container ports, container hardening baseline, ephemeral-by-default sessions). Slices 4 (operator audit log), 5 (privacy page), 6 (gVisor), and 7a/7b/7c (encryption tiers) still pending. Roughly one focused week of work to reach the un-gating bar.

## Local development

Two env vars are introduced by the security hardening; **both should stay unset in dev**:

| Env var | Dev | Prod |
|---|---|---|
| `ANKIFY_SESSION_URL_BASE` | unset → URL becomes `http://localhost:<port>/vnc.html?token=...` (direct loopback) | `https://2anki.net` → URL becomes `https://2anki.net/v/<token>/vnc.html` (Caddy-proxied) |
| `ANKIFY_PROXY_AUTH_TOKEN` | unset → validate endpoint skips the proxy-auth header check | random ≥32 bytes; mirror the same value in the Caddyfile so `forward_auth` sends it as `X-Proxy-Auth` |

In dev the token gets minted and hashed exactly like prod, but the browser hits noVNC directly on the host's loopback port — Caddy `forward_auth` is not on the path, so cookie-binding is not exercised end-to-end. The prod gating is still enforced in code (and unit-tested); only the *transport* is bypassed.

To test the full prod path locally, see the **Local development** section in [security-hardening.md](./security-hardening.md).
