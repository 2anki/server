# ankify — bidirectional Notion ↔ Anki sync

Background-job factories and pure helpers for the Ankify product (separate from the one-shot conversion path). No HTTP, no SQL, no third-party SDK clients here — those live in `src/services/ankify/`.

## What's here

- `jobs/scheduleAnkifyPolling.ts` — schedules the Notion poll loop (5-min cadence; webhook story is deferred per `Documentation/ankify/notion-webhooks-deferred.md`).
- `jobs/scheduleAnkifyReaper.ts` — cleans up dead/expired sessions and tokens.
- `scheduler/instance.ts` — singleton scheduler; survives one process lifetime.
- `nextDailyRunAt.ts` — pure cron-ish next-run calculation. Heavily tested.
- `notionWebhookSignature.ts` — HMAC verification for Notion's webhook payloads. Currently unused in prod (see deferred doc) but kept ready and tested.
- `access.ts` — `hasAnkifyAccess(user)` returns true when `users.patreon === true`. Single source of truth for the gate; consumed by `RequireAnkifyAccess` middleware, `ValidateAnkifySessionTokenUseCase`, and `AnkifyWebhookRouter`.

## Things to know before editing

- **Gate:** Ankify is gated to users with `patreon = true` (lifetime access). Use `hasAnkifyAccess` from `access.ts`; do not reintroduce hard-coded emails. To widen further (e.g., to Stripe subscribers) edit `access.ts` only.
- **Don't add a global `NOTION_WEBHOOK_SECRET`** to docs or setup. That env var was the single-user shape and goes away when the deferred work resumes (per-subscription secrets, auto-registration via the user's OAuth token).
- **Pure functions only.** If you reach for `axios`, `knex`, or `@notionhq/client`, the code belongs in `services/ankify/`.
- The poll cadence is intentional — Notion's free-tier rate limits punish anything tighter. Don't drop it without measuring.
