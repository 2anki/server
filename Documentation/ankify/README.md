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
- [Security hardening: proposed](./security-hardening.md) — current setup is a working PoC, not safe for a second user. Spec covers token-gated proxy + private container ports, container hardening baseline, ephemeral-by-default sessions, operator audit log, and privacy page. Roughly one focused week of work; ship before un-gating the allowlist.
