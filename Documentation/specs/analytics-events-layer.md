# Spec: Server-side analytics events layer

**Outcome**: PM can read `upload_error_chat_shown` / `_engaged` / `_resolved_retry` from SQL within 14 days of PR-merge, unblocking the slice-1 → slice-2 engagement gate (≥10%) declared in `Documentation/chat/roadmap.md`. Designer can pull funnel counts without a GA4 login. Engineer can call `track('event_name', { props })` from any layer (controller, use case, service, or web component) without thinking about transport. **Leading indicator moved**: instrumentation coverage on five named events goes from 0 → 5 in one PR.
**Goal alignment**: 300K-user scale needs us to read user behavior in days, not weeks. Every product gate we declare — chat slice 2, Ankify retention, Notion conversion success — is a guess until this layer ships. This is the metric foundation under every future spec.

## Problem

PR #2319 wired `upload_error_chat_shown` / `_engaged` / `_resolved_retry` as event *names* but nothing receives them. `web/src/lib/analytics/fireAnalyticsEvent.ts` posts to `window.gtag` and `window.hj`, both of which (a) are blocked by every adblocker the target audience runs, (b) require a GA4 dashboard click-quest to read, and (c) cannot record server-side events at all. The chat roadmap's "ship slice 2 when slice 1 hits ≥10% engagement" gate is unenforceable. The same is true for Notion conversion funnel, Ankify weekly active sync, and the AI template counter — none of which are queryable today.

## Decision

**A — `events` table in Postgres + thin server route + web POST helper.**

We already operate the exact pattern: `ObservabilitySink` buffers rows, batch-flushes to `request_logs` / `outbound_call_logs`, and `ObservabilityQueryService` reads them for the ops dashboard. Copying that shape for `events` is half a day's work, queryable with the SQL we already write, and adds zero SaaS dependencies, zero new consent surfaces, and zero per-event PII reviews. PostHog (option B) adds a script tag, a cookie-consent question, and a vendor — too much surface for a metric we want to read this week. GA4 server-side (option C) keeps the data trapped in a UI nobody on the trio enjoys and caps retention at 14 months.

## First slice — ships in one PR

1. **Migration** `migrations/<ts>_events.js` — `events` table: `id bigserial`, `name varchar(64) not null`, `user_id integer null fk users.id on delete set null`, `anonymous_id varchar(64) null` (web visitor cookie), `props jsonb not null default '{}'`, `created_at timestamptz default now()`. Indexes: `(name, created_at)`, `(user_id, created_at)`.
2. **Repository** `src/data_layer/EventsRepository.ts` — `IEventsRepository` with `insertEvents(rows: EventRow[]): Promise<void>`. Run `pnpm kanel` after migration.
3. **Service** `src/services/events/EventsSink.ts` — copy of `ObservabilitySink` shape: buffer + 100-row threshold + 5 s flush interval, repository injected by constructor. Singleton instance in `events/eventsSinkInstance.ts`, started in `server.ts`.
4. **Server helper** `src/services/events/track.ts` — `track(name, { userId, anonymousId, props })`. Routes that already have `res.locals.user` call this directly; use cases take an `IEventsSink` in the constructor.
5. **Route** `routes/EventsRouter.ts` → `controllers/EventsController.ts` → `usecases/TrackEventUseCase.ts`. `POST /api/events/track` accepts `{ name, props? }`. Controller reads `res.locals.user?.id` and the `anon_id` cookie; never trusts a client-supplied user id. Rate-limit: 60 req/min per IP using existing middleware. Allowlist event names against a frozen `KNOWN_EVENTS` set so the prod table can't be flooded with junk names.
6. **Web helper** `web/src/lib/analytics/track.ts` — `track(name: KnownEvent, props?)` posts to `/api/events/track` via `get2ankiApi()`. Keep `fireAnalyticsEvent.ts` for the existing gtag/hotjar lines (don't churn that until next iteration); the new `track()` is additive. Failure is silent — analytics never breaks the user flow.
7. **Query helper** `src/services/events/EventsQueryService.ts` — `countByName(name, since)` and `countDistinctUsers(name, since)` for the ops dashboard and weekly retro. Three SQL methods, not a framework.

Layer flow: `routes/EventsRouter.ts` → `controllers/EventsController.ts` → `usecases/TrackEventUseCase.ts` → `services/events/EventsSink.ts` → `data_layer/EventsRepository.ts`. Server-side internal calls skip the route and call `services/events/track.ts` directly.

**Riskiest assumption**: chat-error events fire often enough (slice 1 reaches >100 shows in 14 days) for a 10% engagement rate to be statistically meaningful. **Smallest test**: ship the layer + the three chat events first, look at raw counts after 7 days. If `upload_error_chat_shown` < 30 in week 1, the gate is a noise gate and slice 2 unblocks on a different signal.

## Event naming convention

Lowercase `snake_case`, `verb_noun` shape. Past-tense verbs for completed actions, present-tense for displays.

- `upload_started`, `conversion_succeeded`, `conversion_failed`, `deck_downloaded`
- `chat_message_sent`, `chat_attachment_added`
- `upload_error_chat_shown`, `upload_error_chat_engaged`, `upload_error_chat_resolved_retry`
- `paywall_shown`, `paywall_upgrade_clicked`

**PII rules — never store**: filenames, message content, user emails, raw Notion page titles, Stripe IDs, IP addresses, Notion tokens. **Safe to store**: internal `user_id` (already in `users` table), conversion job id, file extension, byte size bucket, error class name, plan tier, boolean feature flags. The controller strips any `props` key matching `/email|token|password|filename|content|title/` before insert — belt and braces against a future caller getting it wrong.

## The five events to wire as proof

1. `upload_error_chat_shown` — fired by web when the chat CTA renders after a failed upload (slice 1 from PR #2319).
2. `upload_error_chat_engaged` — fired by web when the user clicks into chat from the error CTA.
3. `upload_error_chat_resolved_retry` — fired by server when an upload from a user who previously fired `upload_error_chat_engaged` then succeeds within the next 30 min (correlation by `user_id` / `anonymous_id`).
4. `conversion_succeeded` — fired by server in the job runner on success. Carries `{ source: 'notion' | 'upload' | 'google_drive', card_count_bucket: '<50' | '50-499' | '500+' }`. Lets us read the actual conversion-success rate from the CLAUDE.md leading indicators table.
5. `deck_downloaded` — fired by web on the existing download click (replace the gtag call). Closes the funnel: upload → convert → download.

## Free vs paid

This does **not** care about plan tier. We track free and paid identically. Plan tier may appear as a `props` field (`{ plan: 'free' | 'subscriber' | 'lifetime' }`) when the event is plan-relevant (paywall events), never as a gate on whether the event fires. The engineer should not add a `hasAnkifyAccess`-style check anywhere in this code path.

## Out of scope (next iteration)

- Funnel visualizations, retention curves, cohort charts — the ops dashboard can render counts; anything richer is later.
- A/B testing infrastructure. Events feed it; experiments aren't this PR.
- Custom user-property tracking. Joins through `events.user_id → users` cover the cases we need.
- GDPR DSR handling — existing `users` deletion patterns cascade to `events.user_id` via `on delete set null`. No new DSR work.
- Historical backfill. We start counting from PR merge; no attempt to reconstruct yesterday.
- Replacing the existing gtag/hotjar lines. They keep firing alongside — removal is a separate small PR once the new layer has 14 days of clean data.
- A web SDK with batching / offline queue. The web sends one POST per event; if the network is offline, the event is lost. Acceptable for v1.

## Open questions

1. Should `track()` also push to Sentry breadcrumbs when called from a request context? Useful for "what was the user doing right before the error" — but it's a separate layer's concern and may add log volume. **PM lean**: no for v1; revisit if Sentry breadcrumbs come up in a real debugging session.
2. Where does `anonymous_id` live for not-logged-in web traffic? Proposal: first-party cookie set on first page load, `crypto.randomUUID()`, 1-year expiry, `SameSite=Lax`. Engineer should confirm we don't already have one (the hotjar `_hjid` cookie exists but is third-party-managed and not safe to reuse).
3. Do we want a denylist on the `props` schema in addition to the regex strip, e.g. reject any value > 1 KB? Probably yes — needed to stop a misuse like `track('x', { notion_page: entirePageHtml })`. Add a 1 KB total `JSON.stringify(props)` cap in the controller.
