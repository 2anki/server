# Notion webhooks: deferred (2026-05-07)

## Status

The Notion webhook receiver code exists but is **intentionally not wired up for active use**. Polling carries the near-realtime story instead.

- Receiver: `src/routes/AnkifyWebhookRouter.ts` (mounted before `express.json` for raw-body access)
- Signature verification: `src/lib/ankify/notionWebhookSignature.ts` (HMAC-SHA256 over the raw body, `x-notion-signature` header, supports both raw hex and `sha256=` prefix; unit-tested)
- Polling fallback: `src/lib/ankify/jobs/scheduleAnkifyPolling.ts` runs every 5 minutes and re-syncs every enabled subscription via `SyncNotionPageToRacUseCase`

If `NOTION_WEBHOOK_SECRET` is unset, the receiver returns 500 to any incoming POST. If set but the body's signature doesn't match, 401. Either way it fails closed and never affects other endpoints.

## Why deferred

The current implementation reads the secret from a single `NOTION_WEBHOOK_SECRET` env var. That model assumes one user / one Notion workspace / one human in Notion's dashboard pasting a manually-created webhook secret. It works for solo testing but breaks the moment a second user is onboarded: each new user would have to manually create a webhook in Notion's integration settings and hand the secret to the operator. That's friction we don't want for a beta.

The right architecture is **per-subscription secrets, auto-registered on subscribe** — see "Design when we resume" below. That work was scoped out so the rest of the ankify port could ship cleanly.

## Local-dev story

Notion's servers POST to whatever URL was registered, so the URL has to be reachable from the public internet. `localhost` and `192.168.x.x` are not.

For pure functional development, **skip webhooks and rely on polling**. The 5-minute cadence is plenty for verifying conflict detection, dispatch, and review-export end-to-end. Most of the surface is testable this way.

When we want to verify the webhook path itself end-to-end:

- `ngrok http 2020` — fastest. Set `PUBLIC_BASE_URL=https://...ngrok.app` in `.env`. URL changes every restart unless on a paid tier.
- Cloudflare Tunnel (`cloudflared`) — free, can pin a stable subdomain.
- VS Code dev tunnels — built in, free.

The auto-registration flow (when implemented) will tell Notion to POST to `${process.env.PUBLIC_BASE_URL}/api/ankify/webhook/notion`. Production sets `PUBLIC_BASE_URL=https://2anki.net`. Same code path.

## Design when we resume

### Schema

Extend `ankify_notion_subscriptions`:

```sql
ALTER TABLE ankify_notion_subscriptions
  ADD COLUMN notion_webhook_id TEXT NULL,
  ADD COLUMN webhook_secret TEXT NULL,
  ADD COLUMN webhook_status VARCHAR(16);
-- webhook_status: pending_verification | active | failed | unsupported
```

`webhook_secret` should be encrypted at rest. The simplest path is an app-level cipher with a key from env; the existing `lib/misc/hashToken.ts` is a usable reference for the pattern but we'd want symmetric encryption (not one-way hash) since we have to recover the secret to verify the next inbound HMAC.

### Auto-register flow

After `SyncNotionPageToRacUseCase.execute(...)` returns successfully on a fresh subscription:

1. Read the user's Notion access token via `INotionRepository.getNotionToken(owner)`.
2. Call Notion's "create webhook" endpoint using that token, supplying:
   - The page resource the subscription targets
   - `${PUBLIC_BASE_URL}/api/ankify/webhook/notion` as the delivery URL
3. Notion responds with a subscription id and signing secret (and possibly a one-time verification challenge — see below).
4. Persist `notion_webhook_id` and `webhook_secret` on the `ankify_notion_subscriptions` row.

### Webhook handler change

Today's handler reads `process.env.NOTION_WEBHOOK_SECRET`. Replace with:

1. Parse the inbound payload's metadata (Notion includes `workspace_id`, `subscription_id`, and the affected `page_id` or `block_id`).
2. Look up the matching `ankify_notion_subscriptions` row by whichever of those identifiers Notion is most stable about (likely `subscription_id` if we store it; falls back to `notion_page_id`).
3. Verify HMAC against that row's `webhook_secret`.
4. Drop the `NOTION_WEBHOOK_SECRET` env var. Drop the global `verifyNotionWebhookSignature(rawBody, signature, env.SECRET)` shape; pass the per-row secret in.

### Verification challenge

Notion's webhook setup typically includes a one-time challenge — Notion POSTs a `verification_token` (or similar payload type) before any signed events arrive, and the receiver must echo it back to prove ownership of the URL. The handler needs to detect this payload and respond accordingly (200 with the echoed token), then mark `webhook_status = 'active'` once the first signed event verifies.

### Cleanup on unsubscribe

When `DeleteNotionSubscriptionUseCase` runs, it should also call Notion's API to delete the corresponding webhook so we don't leak dead subscriptions in the user's Notion workspace. Best-effort; failure to delete on Notion's side shouldn't block our row deletion.

## Notion API verification (must-do before coding)

The Notion webhook product is in beta and the API has shifted multiple times:

- Whether webhooks are scoped per-integration, per-page, or per-workspace
- Whether the signing secret is one-per-integration or one-per-subscription
- The exact create/list/delete endpoint paths
- Whether the verification challenge payload still uses `verification_token` or a renamed field

**Before writing the auto-registration call, fetch Notion's current docs and confirm.** The implementation should treat the API surface as live information, not memorized.

The signature verification function is parameterized (`verifyNotionWebhookSignature(rawBody, signature, secret)`) and isolated in `src/lib/ankify/notionWebhookSignature.ts`. If Notion changes their signing scheme, that's the only file that needs updating, and it has unit tests.

## Don't forget to remove

When this is implemented:

- Drop `NOTION_WEBHOOK_SECRET` from any docs/setup steps
- Remove the `process.env.NOTION_WEBHOOK_SECRET` read in `AnkifyWebhookRouter.ts`
- Update `Documentation/ankify/README.md` to drop the "deferred" pointer
- Delete this file
