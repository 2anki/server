# Hosted Anki — open the waitlist as a self-serve $30/mo plan

> User-facing name: **Auto Sync**. Internal name: **Hosted Anki** / **Ankify**.

### Trio synthesis

- **PM**: open the existing `/pricing` waitlist as a self-serve Stripe checkout at $30/mo, gate widens to `patreon === true OR active Hosted Anki subscription`, target +10 paying subscribers in 30 days (≈ $300 MRR), ship behind a soft `HOSTED_ANKI_MAX_SUBSCRIBERS` env cap (default 50) so growth doesn't outrun the ~15–25 concurrent-container ceiling in `Documentation/ankify/scaling.md`.
- **Designer**: strip the "preview" treatment from the Auto Sync card (dashed border, hatched background, sync-dots), keep it in the middle slot, "New" chip for the first 30 days only, CTA becomes `Subscribe`, benefit list rewritten to lead with "Everything in Unlimited", waitlisted users get a one-line caption, lifetime users see "Included in your Lifetime plan" with the price hidden.
- **Engineer**: M effort. Migration adds `stripe_product_id` to the `subscriptions` table; `updateStoreSubscription` stamps the column; gate widens at three consumers (`access.ts`, `RequireAnkifyAccess`, `ValidateAnkifySessionTokenUseCase`). Worktree required — touches payments + migrations.
- **Agreement**: open the waitlist; gate widens with OR semantics; patreon/lifetime stay grandfathered; reuse the existing Stripe webhook path; no trial in v1; warm the launch by emailing the existing `hosted_anki_requested_at` cohort first.
- **Conflicts**:
  1. *Upgrade-overwrite risk* — engineer flagged that `subscriptions.onConflict('email').merge()` means an Unlimited subscriber upgrading to Auto Sync would overwrite their Unlimited row. v1 resolution: require the user to cancel Unlimited via the Stripe billing portal before subscribing to Auto Sync; schema change to allow multiple rows per email is deferred.
  2. *"How Auto Sync works" explainer* — designer wanted a modal to reduce refund risk; PM had it out of scope. Resolution: add a single `Learn how it works` text link under the card pointing at the existing `/docs` Auto Sync page. No modal, no new screen.
  3. *Public naming* — PM used "Hosted Anki" in prose; designer wants user-facing copy to stay "Auto Sync". Designer wins for all user-visible strings.
- **Resulting plan**: add a `stripe_product_id` column + a new Stripe Product/Price for $30/mo, widen `hasAnkifyAccess` to OR-in subscription rows on that product, swap the Pricing "Auto Sync" card from waitlist-mode to Stripe-checkout-mode with the copy below, ship behind a soft cap env var. **Checkout uses a server-side Stripe Checkout Session (`POST /api/checkout/auto-sync`), not a Payment Link** — the cap can only be enforced server-side, and passing `customer`/metadata binds the subscription to the right user from the first webhook.

---

## Outcome and goal alignment

Convert the Hosted Anki waitlist into a self-serve Stripe checkout at **$30 / month**. **Target: +10 active paying Auto Sync subscribers in the first 30 days (≈ $300 MRR); ≥2% Stripe-checkout-start rate on Auto Sync card views within 60 days.**

Goal alignment: the "simplest, fastest way to turn what you study into beautiful Anki flashcards" breaks for users whose notes keep evolving in Notion — today every change forces a re-import. Auto Sync closes that loop. Opening it at a price that covers per-container infra (~700 MiB PSS; $30 ≈ 25× marginal compute) is the only path that lets it contribute to the 300K-user trajectory instead of remaining a lifetime-only artifact.

## Problem

A waitlist exists (`users.hosted_anki_requested_at`) and the visible CTA is "Coming soon — Join the waitlist." No one on that waitlist can pay. The current price ladder is Free → Unlimited $6/mo → mailto Lifetime $345 — a 57× gap. Every visitor who wants ongoing sync without committing $345 falls through. Specific instance: the waitlist *exists* because visitors keep asking; we have the request data and zero conversion path.

## Riskiest assumption + smallest test

**Assumption**: ≥2% of visitors who currently click "Join the waitlist" will pay $30/mo when shown a Stripe checkout instead. $30 is 5× Unlimited and 1/12× Lifetime — no comparable anchor exists in the current ladder.

**Smallest test (before any code)**: Alexander emails the existing `hosted_anki_requested_at` cohort with a manually-generated Stripe payment link at $30/mo and a one-paragraph offer. If <5% of replies convert within 7 days, the price or the value prop is wrong — revisit before touching the pricing page. PM drafts the email via `/support-reply`; Alexander sends.

## Scope

**In**:
- New Stripe Product + recurring Price ($30/mo) in the test and live dashboards.
- New migration: nullable `stripe_product_id varchar(255)` on `subscriptions`; `pnpm kanel` regen.
- `updateStoreSubscription` writes `stripe_product_id` from `subscription.items.data[0].price.product`.
- `hasAnkifyAccess` widens to `patreon === true OR (active subscription with product ID === AUTO_SYNC_PRODUCT_ID)`. Three consumers updated consistently.
- Swap the `Auto Sync` pricing card from waitlist mode (`comingSoon`, `Join the waitlist`) to live mode (`$30 / mo`, `Subscribe`), with the copy and states in **Design notes** below.
- **Checkout via server-side Stripe Checkout Session, not a Payment Link.** New `POST /api/checkout/auto-sync` → controller → `AutoSyncCheckoutUseCase` creates a `stripe.checkout.sessions.create({ mode: 'subscription', line_items: [{ price: AUTO_SYNC_PRICE_ID, quantity: 1 }], customer or customer_email, success_url: '/ankify/setup', cancel_url: '/pricing', metadata: { user_id } })` and returns `{ url }`; frontend does `location.href = url`. Reasons over a Payment Link: (a) the soft cap can only be enforced server-side, (b) passing `customer` (or stamping `users.stripe_customer_id` on first checkout) binds the subscription to the right user from the first webhook, mitigating the `onConflict('email').merge()` overwrite risk.
- Soft cap env: `HOSTED_ANKI_MAX_SUBSCRIBERS` (default `50`). `AutoSyncCheckoutUseCase` counts active Auto Sync subscriptions and refuses with `{ status: 'cap_reached' }` when the cap is hit; the frontend interprets that response by flipping the card back to waitlist mode (existing `requestHostedAnkiAccess` flow). The card also receives a server-rendered flag in `getUserLocals` so first paint is correct.
- Already-Auto-Sync-active short-circuit: `AutoSyncCheckoutUseCase` returns `{ status: 'already_subscribed' }` instead of creating a duplicate session.
- A `Learn how it works` link under the card → `/docs/...` Auto Sync page (existing).

**Out**:
- Trial period for Auto Sync (the 7-day Unlimited trial is a separate code path; bolting it on adds container-cost risk against an unproven price).
- Annual pricing, team/multi-seat, in-product upsell from the conversion flow.
- Refund / proration policy changes (default Stripe behavior; refunds case-by-case via support).
- RAC workspace redesign or onboarding screen.
- Schema change to allow multiple active subscriptions per email (deferred; v1 requires Unlimited → cancel → Auto Sync).
- Notion-webhook story (stays deferred per `Documentation/ankify/notion-webhooks-deferred.md`).
- Marketing-site changes outside `/pricing`.

## User story + acceptance criteria

> As a logged-in free user with notes already in Notion, I want to subscribe to Auto Sync from `/pricing` in one click so that I can start syncing without emailing anyone.

- [ ] The Auto Sync card on `/pricing` shows `$30` / `/ mo` and a `Subscribe` button (sentence case, no "my", no exclamation, no "Coming soon" chip).
- [ ] Logged-out click → `/login?redirect=/pricing` (matches Unlimited).
- [ ] Logged-in click → frontend POSTs `/api/checkout/auto-sync`; server returns `{ url }` (Stripe Checkout Session); frontend redirects there; success redirect → `/ankify/setup`, cancel redirect → `/pricing`.
- [ ] Server refuses the checkout request with `{ status: 'cap_reached' }` when active Auto Sync subs ≥ `HOSTED_ANKI_MAX_SUBSCRIBERS`; frontend flips the card to waitlist mode.
- [ ] Server returns `{ status: 'already_subscribed' }` (no duplicate session) when the user already has Auto Sync active.
- [ ] `hasAnkifyAccess(user, subscriptions)` returns `true` when `user.patreon === true` OR `subscriptions` includes an `active` row with `stripe_product_id === AUTO_SYNC_PRODUCT_ID`. No hard-coded emails.
- [ ] Patreon/lifetime users continue to see Auto Sync; the card shows `Included in your Lifetime plan`, the price block is hidden.
- [ ] Already-Unlimited subscribers see a caption: `Upgrade from Unlimited — keep everything you have.` (No proration UI; Stripe handles it.)
- [ ] Waitlisted users (`hostedAnkiRequested === true`) see the normal `Subscribe` button plus a caption: `You joined the waitlist — it's open now.`
- [ ] On cancellation (`customer.subscription.deleted` or `cancel_at_period_end`), access remains until `current_period_end`, then revokes; the existing reaper cleans up RAC containers on its next tick.
- [ ] Sidebar shows the Auto Sync entry for both gate paths (patreon OR active Auto Sync sub).
- [ ] When active Auto Sync subscriptions ≥ `HOSTED_ANKI_MAX_SUBSCRIBERS`, the card flips back to waitlist mode (server-side flag).
- [ ] Tests: `access.ts` unit covers the new OR branch; `RequireAnkifyAccess` middleware test covers subscription-active path; `PricingPage.test.tsx` covers the new CTA label + click target and the three caption variants.

## Leading indicator

**Primary (leading)**: Stripe-checkout-start rate on the Auto Sync card (clicks per card view). Target ≥2% within 60 days.
**Secondary (lagging)**: MRR delta and Auto Sync churn at month 2.
Both are visible on the existing `/ops` dashboard once the new product ID is in the subscriptions table.

## Open questions for engineering

1. **Existing waitlist (~N users in `hosted_anki_requested_at`)** — email them with a checkout link 48h before flipping the public CTA. This doubles as the riskiest-assumption test above.
2. **`subscriptions.onConflict('email').merge()`** — confirm with a Stripe-dashboard spike: are there any current users holding two simultaneous active subscriptions? If yes, v1 has a real edge case and we need a schema discussion before launch.
3. **`past_due` / `unpaid` status handling** — `updateStoreSubscription` sets `active = false`, which correctly closes the gate, but no email is sent and no retry window is surfaced. Flag for follow-up (UX), not a launch blocker.
4. **Repurpose `hosted_anki_requested_at`?** — retain the column; treat it as "expressed interest" funnel data. The `requestHostedAnkiAccess` route can stay as a no-op or be reused for the soft-cap waitlist when the cap is hit.

---

## Design notes (from designer)

### User moment
A returning visitor who already knows the free tier isn't enough, lands on `/pricing` ready to pay, and today sees only `$6` Unlimited or a `$345` application — with the one thing they actually want (sync) hidden behind a waitlist. We are removing the dead end.

### Card composition
- **Order**: keep left → right as Unlimited → Auto Sync → Lifetime. Don't transfer the elevated `cardPro` treatment (gradient bar, indigo glow, `translateY`) onto Auto Sync — Unlimited stays the anchor.
- **Visual treatment**: solid card. Strip the dashed border, hatched stripe background, sync-dot animation, and `cardComingSoon` shell — these are what currently say "you can't buy this." Single biggest lever.
- **Price**: `$30` / `/ mo`, same `.cardPrice` Fraunces lockup as Unlimited. Do **not** introduce a new size tier between Unlimited and Lifetime — $30 should look like $6's sibling, not Lifetime's.
- **Chip**: `New` chip, muted neutral (border + secondary text, **not** the indigo gradient Unlimited uses for "Best for most"). Remove after 30 days.

### Copy strings (exact)

| Slot | String |
|---|---|
| Card title | `Auto Sync` |
| Badge (first 30 days only) | `New` |
| Price | `$30` |
| Price suffix | `/ mo` |
| Benefit 1 | `Everything in Unlimited` |
| Benefit 2 | `Notion edits sync to Anki every 5 minutes` |
| Benefit 3 | `Anki desktop in your browser — no install` |
| Benefit 4 | `Multi-device — study from any browser` |
| Benefit 5 | `Cancel anytime` |
| Primary button | `Subscribe` |
| Under-card link | `Learn how it works` → `/docs/...` Auto Sync page |
| Caption (waitlisted) | `You joined the waitlist — it's open now.` |
| Caption (Unlimited subscriber) | `Upgrade from Unlimited — keep everything you have.` |
| Caption (lifetime/patreon) | `Included in your Lifetime plan` (replaces button; price hidden) |
| Soft-cap fallback CTA | `Join the waitlist` (existing waitlist behavior, when active subs ≥ cap) |

Delete `HOSTED_ANKI_LABELS` ("Join the waitlist" / "Joining…" / "On the waitlist ✓" / "Try again") from `PricingPage.tsx` — replaced by the table above (except the soft-cap fallback, which can reuse the existing waitlist code path).

### Edge / empty states

| State | Treatment |
|---|---|
| Logged out | `Subscribe` → `/login?redirect=/pricing` |
| Free, not waitlisted | Default card; no caption |
| Free, waitlisted | `Subscribe` + waitlisted caption |
| Unlimited subscriber | `Subscribe` + Unlimited caption (proration handled by Stripe) |
| Lifetime / patreon | No button; "Included in your Lifetime plan" line; price hidden |
| Already subscribed to Auto Sync | Reuse the existing "subscribed" pattern Unlimited already uses (disabled state or hidden card) — don't invent a new one |
| Cap reached (`active >= HOSTED_ANKI_MAX_SUBSCRIBERS`) | Card reverts to waitlist mode using existing `requestHostedAnkiAccess` flow |

### Risk to flag (designer)
The benefit "Anki desktop in your browser" is honest but introduces a concept the visitor hasn't met. A user could click expecting AnkiWeb-style sync, see a remote desktop, and refund. The `Learn how it works` link is the v1 mitigation; if refunds spike, the next move is a screenshot panel that appears when the Auto Sync card is the focused card. Out of scope for this PR.

---

## Technical pre-flight (from engineer)

### Layers touched

| Layer | Why |
|---|---|
| `data_layer` | Migration: add `stripe_product_id varchar(255)` nullable on `subscriptions`. Add `stripe_customer_id varchar(255)` nullable on `users` if not already present (used to bind the checkout session to an existing customer on the second purchase). Regenerate types with `pnpm kanel`. |
| `services` | `SubscriptionService` gains a query that filters by product ID so the gate can distinguish $30 Auto Sync from $6 Unlimited. New `AutoSyncCheckoutService` (or method on existing `StripeService`) wraps `stripe.checkout.sessions.create`. |
| `usecases/checkout` | New `AutoSyncCheckoutUseCase`: enforces cap, short-circuits already-subscribed, creates the Stripe Checkout Session with `metadata.user_id` and `customer` (when known), returns `{ url } \| { status }`. |
| `controllers` | New `AutoSyncCheckoutController` thin HTTP wrapper. |
| `routes` | New `POST /api/checkout/auto-sync` mounted in an existing checkout router (or a new one if none fits). |
| `lib/ankify/access.ts` | `hasAnkifyAccess` accepts subscription rows in addition to the user, OR-s the active-Auto-Sync check into the existing `patreon === true` fast path. |
| `routes/middleware` | `RequireAnkifyAccess` fetches subscriptions and threads them into the gate. |
| `usecases/ankify` | `ValidateAnkifySessionTokenUseCase` — same widening. |
| `lib/integrations/stripe.ts` | `updateStoreSubscription` writes `stripe_product_id` extracted from `subscription.items.data[0].price.product` and includes it in the `onConflict('email').merge()` columns. Also persists `stripe_customer_id` onto `users` when present in the webhook payload. |
| `routes/WebhookRouter.ts` | No new event type — `customer.subscription.updated` already routes to `updateStoreSubscription`. Verify the path stamps the new column. Confirm `checkout.session.completed` for `mode: subscription` also lands us in a consistent state (it usually fires before the first `customer.subscription.created`). |
| `web` | `PricingPage.tsx` (CTA POSTs to the new endpoint instead of opening a Payment Link), `pricing.constants.ts`, `Backend.ts` (`startAutoSyncCheckout()`), `getUserLocals.ts` (carry the soft-cap flag for first paint). `payment.links.ts` is unchanged — Unlimited stays a Payment Link, only Auto Sync uses server-side checkout. |

### Files in play
**Server**: `src/lib/ankify/access.ts` (+ `access.test.ts`), `src/routes/middleware/RequireAnkifyAccess.ts` (+ test), `src/usecases/ankify/ValidateAnkifySessionTokenUseCase.ts`, `src/services/SubscriptionService.ts` (+ test), `src/lib/integrations/stripe.ts`, `src/routes/WebhookRouter.ts`, `src/controllers/StripeController/StripeController.ts`, new `src/usecases/checkout/AutoSyncCheckoutUseCase.ts` (+ test), new `src/controllers/AutoSyncCheckoutController.ts` (+ test), new route entry, `src/data_layer/public/Subscriptions.ts` and `Users.ts` (regenerated — do not edit by hand), new migrations `migrations/<ts>_add_stripe_product_id_to_subscriptions.js` and (if needed) `migrations/<ts>_add_stripe_customer_id_to_users.js`.
**Web**: `web/src/pages/PricingPage/PricingPage.tsx` (+ `.test.tsx`), `web/src/lib/backend/Backend.ts` (add `startAutoSyncCheckout(): Promise<{ url } | { status: 'cap_reached' | 'already_subscribed' }>`), `web/src/lib/backend/getUserLocals.ts` (carry `autoSyncCapReached` flag for first paint), `web/src/pages/PricingPage/pricing.constants.ts` (add `AUTO_SYNC_PRICE = '$30'`, reuse `MONTHLY_SUFFIX`), `web/src/pages/PricingPage/PricingPage.module.css` (delete `.cardHosted` hatched background, `::after` sync-dots, `syncDots` keyframes, `.cardComingSoon` shell, mobile `order: 3`). `payment.links.ts` untouched.

### Cross-language coordination
None. The Python conversion bridge (`create_deck/create_deck.py`) has no knowledge of subscription gates.

### Estimated effort: **M**
One migration, ~5 server files, ~3 web files, tests at each. Most of the work is in the gate-widening + the Stripe-product-ID write path — both fragile, both worth tests. Frontend is small (swap props, add a constant, delete CSS).

### Security / testing / migration concerns
- **Webhook signature verification**: already enforced in `WebhookRouter.ts` via `stripe.webhooks.constructEvent`. No change.
- **Migration**: nullable column → no backfill needed. Existing rows populate on their next `customer.subscription.updated`. **Do not** call Stripe inside the migration.
- **Backwards compat**: `patreon === true` stays the fast path in `hasAnkifyAccess`. Lifetime users are never touched.
- **Status transitions**: `trialing` → `active = false` today (correct for Auto Sync since there's no trial); `past_due`/`unpaid` → `active = false` (closes the gate; UX follow-up to send email is out of scope); `canceled` → existing path; `cancel_at_period_end` → already correct.
- **Upgrade overwrite (real)**: `subscriptions.onConflict('email').merge()` keeps one row per email. v1 requires the user to cancel Unlimited via the Stripe billing portal before subscribing to Auto Sync. Spike before coding: query Stripe for any current customers with two active subs.
- **Worktree required** — touches payments + migrations. Per CLAUDE.md, `EnterWorktree` before the first `Edit`/`Write`.
- **`/security-review`** before merge (auth + payments rule).
- **`sonar-scanner` locally** before flipping the PR ready.

### Stripe configuration (prerequisite, not code)
1. ✅ Live Product `Auto Sync` created: `prod_UWodEo1xzutALf`, recurring price `price_1TXl0GB4lekI0uHmoNrklDeU` ($30 USD/month).
2. Create the matching Product + Price in the **test** dashboard; capture the test `price_…` ID.
3. Set in `.env`, prod, and CI:
   - `AUTO_SYNC_PRODUCT_ID=prod_UWodEo1xzutALf`
   - `AUTO_SYNC_PRICE_ID=price_1TXl0GB4lekI0uHmoNrklDeU` (use the test price ID in dev/CI)
   - `HOSTED_ANKI_MAX_SUBSCRIBERS=50` (or leave to the code default)
4. Confirm `STRIPE_SECRET_KEY` is available (it is — the existing webhook handler uses it).
5. No Payment Links required — `AutoSyncCheckoutUseCase` creates Checkout Sessions on demand.
6. (Optional, follow-up) Re-check the Stripe Tax category — currently `txcd_10103001` ("SaaS — business use"). For individual learners "SaaS — personal use" is usually more accurate; only matters for VAT computation.
