# Spec: `/ops` v2 — Business tab (Stripe)

**Outcome**: Al opens `/ops/business` and within 5 seconds knows: are we earning more this month than last, are paying users churning, and are payments failing. Six numbers, one screen, ≤15 min stale. The Engineering tab stays at `/ops`, unchanged.

**Goal alignment**: The 300K-user goal is gated on a sustainable revenue floor. Right now Al checks Stripe's dashboard manually; that friction means we look at it weekly instead of daily. Same-tab visibility makes "is this PR earning its complexity?" a daily question.

**Problem**: Engineering signals (latency, errors) and business signals (MRR, churn, failed payments) currently live in two different tools. We have no view that answers "are we growing?" alongside "are we healthy?" — and qualitative user feedback doesn't aggregate into a number, so it doesn't belong on this dashboard.

## Scope

**In:** Two tabs under `/ops` (Engineering default, Business). Six Stripe metrics on the Business tab: MRR, net new MRR MTD, active paying subs, trailing-30d churn %, failed payments last 7d, new paid conversions last 7d. 15-min server-side cache. Owner-only (404 for others).

**Out:** per-customer drill-down, refund tracking, cohort analysis, LTV, ARPU, Stripe webhooks, charts/sparklines/trend arrows in v2, historical Postgres snapshots, alerting, currency conversion (USD only — same as our Stripe account).

## Decision: read from local `subscriptions` table, hit Stripe only for failed payments

We already maintain a `subscriptions` table populated by `updateStripeSubscriptions` (in `src/lib/storage/jobs/helpers/`). Every active row's full Stripe `Subscription` object lives in the `payload` JSON column — `items[].price.unit_amount`, `quantity`, `canceled_at`, `cancel_at_period_end` are all there. **Five of the six metrics are pure SQL.** Only failed payments needs a live Stripe call (no mirror table for invoices yet).

| Metric | Source |
|---|---|
| `mrr_usd` | `subscriptions` rows where `active = true`, sum `payload->items[].price.unit_amount × quantity`, normalize to monthly |
| `active_paying_subs` | `count(*) where active = true` |
| `net_new_mrr_mtd_usd` | sum payload amounts for rows where `created_at >= date_trunc('month', now())` |
| `new_paid_conversions_7d` | `count(*) where created_at >= now() - interval '7 days'` |
| `churn_30d_pct` | denominator: count active 30d ago (rows with `created_at < now()-30d` and `(payload->>'canceled_at')::int IS NULL OR > extract(epoch from now()-30d)`); numerator: rows whose `payload->>'canceled_at'` falls in the last 30d |
| `failed_payments_7d` | Stripe API: `invoices.list({collection_method: 'charge_automatically', created: {gte: ts_7d}})` filtered to `status='open'` with `attempt_count > 0`. 15-min in-memory cache. |

**Critical caveat: the existing `updateStripeSubscriptions` only runs on startup** (gated on `STRIPE_SYNC_ON_STARTUP=true` in `server.ts:137`). For local-first to be accurate, we add a recurring schedule. PR A includes a `setInterval(updateStripeSubscriptions, 60 * 60 * 1000)` in `src/lib/storage/jobs/ScheduleCleanup.ts` so the table refreshes hourly. The startup-only path stays as-is.

No new tables. No persisted snapshots. When we want trend lines (v3), add nightly snapshots then — the table shape will be obvious from a month of real usage.

## Backend

`routes/OpsRouter.ts` adds one endpoint, same `RequireOpsAccess` gate:

```
GET /api/ops/business/metrics  →  RequireOpsAccess  →  OpsController.getBusinessMetrics
```

Layered path (matches existing convention):

- `controllers/OpsController.ts` — new `getBusinessMetrics` method.
- `usecases/ops/GetBusinessMetricsUseCase.ts` — orchestrates the six metric calls, returns the JSON shape below.
- `services/ops/BusinessMetricsService.ts` — owns the in-memory `Map<string, { value, expiresAt }>` cache (15-min TTL). Five methods read via a new `data_layer/SubscriptionsAnalyticsRepository.ts`; the sixth (`failed_payments_7d`) calls the Stripe SDK.
- `data_layer/SubscriptionsAnalyticsRepository.ts` — read-only repo, raw Knex queries with parameterized bindings. JSON-path operators on the `payload` column (`payload->'items'`, `(payload->>'canceled_at')::int`).
- `lib/storage/jobs/ScheduleCleanup.ts` — add hourly `setInterval(updateStripeSubscriptions, 60*60*1000)`. Wrap with the existing error handling pattern (the startup invocation already does `.catch(console.error)`).

Response shape (flat, no nesting — matches the card grid):

```json
{
  "mrr_usd": 4820,
  "net_new_mrr_mtd_usd": 312,
  "active_paying_subs": 184,
  "churn_30d_pct": 2.1,
  "failed_payments_7d": 4,
  "new_paid_conversions_7d": 11,
  "as_of": "2026-05-09T14:32:07Z",
  "cache_age_seconds": 412
}
```

Cache is per-metric, 15-min TTL, populated lazily. A single request that finds all six expired calls Stripe in parallel via `Promise.all`. If any one metric throws, return the others with `null` for the failed ones plus a top-level `errors: [{metric, message}]`. Never 500 the whole endpoint over one slow Stripe call.

## Auth

Identical to v1: `RequireOpsAccess` middleware, returns 404 for any email other than `alexander@alemayhu.com`. No change.

## Frontend

**Tab placement:** inline tabs directly under the `Ops` h1, above the existing window selector / refresh row. Two tabs only: `Engineering` (active on `/ops`) and `Business` (active on `/ops/business`). Reuse the existing `.surface` border treatment as the tab bar's bottom border so it merges with the panel grid below.

**Routing:** in `App.tsx`, register `/ops/business` as a sibling lazy route. Both routes render a shared `OpsLayout` (h1 + tabs + outlet); the existing chart grid moves into an `EngineeringTab` component, the new view goes in `BusinessTab`. Tabs are `<Link>`s, not state — path-based, reload-safe, screenshot-shareable.

**Card shape:** single big number per card. No sparklines, no trend arrows in v2 — without persisted history we'd be faking deltas, and a fake delta is worse than no delta. Each card is one `.surface` panel:

```
+--------------------------------+
| MRR                            |   <- panel title, --text-base, semibold
| $4,820                         |   <- big number, --text-3xl, mono, primary
| as of 14:32 (cache 7m old)     |   <- footnote, --text-xs, tertiary
+--------------------------------+
```

Six cards in a 3x2 grid on desktop (`repeat(3, 1fr)`), 2x3 on tablet, 1x6 on mobile. Same 1rem gap as the engineering grid. Designer owns final number formatting (`$4,820` vs `$4.8K`, percent precision, etc.) — set the shape, not the typography.

The six cards in render order (left-to-right, top-to-bottom): MRR, Net new MRR MTD, Active paying subs, Churn 30d, Failed payments 7d, New paid conversions 7d. Money first, health second, hygiene third — matches how Al would scan it.

Auto-refresh: same 30s interval as Engineering, but the server cache is 15 min, so most refreshes will return identical data. The footnote `cache Xm old` makes that visible without surprising anyone.

## Out of scope (next iteration)

Per-customer drill-down. Refund tracking. Cohort analysis. LTV / ARPU. Sparklines and trend arrows (need persisted history first). Stripe webhooks (poll-on-demand is fine at our volume). Historical Postgres snapshots. Alerting. A "Design" tab (qualitative feedback doesn't aggregate). Multi-currency.

## Rollout: split into two PRs, in this order

1. **PR A — backend + tab scaffolding.** New endpoint, `StripeMetricsService`, `RequireOpsAccess` reuse, `OpsLayout` + tabs, `BusinessTab` renders raw JSON in a `<pre>` for sanity. Ships behind the existing email gate; nobody else sees it. Lets Al verify Stripe numbers match the real dashboard before any visual work.
2. **PR B — card grid.** Replace the `<pre>` with the six-card grid. Pure frontend change, no API churn.

Splitting catches Stripe-shape surprises (especially MRR computation, which has edge cases around discounts and trials) before the visual layer obscures them. PR A is the risky one; PR B is cosmetic.

## Open questions

1. **MRR definition** — sum `payload->items[].price.unit_amount × quantity` for `active=true` rows, normalize per-item by `recurring.interval` (yearly → /12, weekly → ×4.33, etc.). Reconcile against Stripe's dashboard MRR in PR A. If >2% drift, revisit before PR B.
2. **Trial subs** — Stripe sets `status='trialing'` for trials, so they're already excluded from our `active=true` rows (the existing job only flips `active` when `status === 'active'`). No extra filtering needed.
3. **Currency** — Stripe account is USD-only today. If we ever add a second currency, this design breaks; flag now so we don't ship multi-currency support reactively.
4. **Local table staleness window** — with a 1h cron, the worst-case staleness is ~60 min. For a 15-min-cached "as of" timestamp on the response, that's fine. If reconciliation in PR A shows we want fresher data, we tighten the cron to 15 min (still well within Stripe rate limits).
