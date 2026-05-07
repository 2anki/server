# CLAUDE.md

## Ankify lib helpers

Pure functions and background-job factories. No HTTP, no SQL, no third-party SDK clients (those live in `src/services/ankify/`).

## Notion webhooks

The webhook receiver in `src/routes/AnkifyWebhookRouter.ts` and the signature verifier here are intentionally not active in production — see `Documentation/ankify/notion-webhooks-deferred.md` for the deferred design (per-subscription secrets, auto-registration via the user's OAuth token, local-dev tunnel story). Polling at 5 min carries the near-realtime story today.

Don't add a global `NOTION_WEBHOOK_SECRET` story to docs or setup steps — that env var is the single-user shape and goes away when the deferred work resumes.
