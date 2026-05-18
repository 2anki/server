# Pricing honesty

**Date:** 2026-05-18
**Trio review context:** Ahead of Notion Marketplace launch, a trio review on 2026-05-18 identified three claims on `/pricing` that do not match shipped code. Fixing them before the launch avoids misleading new users who arrive with raised expectations.

---

## Problem

Three claims on the pricing page are unverified or false:

1. **"Anki desktop in your browser" (Auto Sync, $30/mo).** `web/src/pages/PricingPage/PricingPage.tsx` (~line 188) shows a Subscribe button. The backend route `/api/users/request-hosted-anki-access` only records `hosted_anki_requested_at` in the database — no serving layer exists. The feature is not available to subscribers.

2. **Lifetime price advertised at $345–$500; actual threshold is $96.** `src/routes/WebhookRouter.ts` line 232 sets `LIFE_TIME_PRICE = 9600` (cents). Any one-time Stripe payment ≥ $96 grants `patreon = true` and full Lifetime access. The page copy implies an order-of-magnitude higher price.

3. **"One Anki → Notion import" for free users.** `ApkgController.importToNotion` (~line 274) gates only on a 5,000 vs 1,000 note cap keyed to `isPaying`. No per-user import counter exists; free users can import without limit.

---

## Goal

Remove or reword all three claims so every sentence on `/pricing` matches what the code actually does — before Notion Marketplace launch.

---

## Proposed approach

**Claim 1 — hosted Anki.**
Drop the "Anki desktop in your browser" bullet from the Auto Sync plan. A half-built feature should not appear on a paid plan. Option (b) — reword to "joining waitlist" — would still misrepresent the current UX (the Subscribe button is shown, not a waitlist button). Option (c) — build the serving layer — is out of scope. Recommendation: **remove the bullet**.

**Claim 2 — Lifetime webhook threshold.**
Add a Stripe product ID allowlist to the Lifetime grant logic. The existing `AUTO_SYNC_PRODUCT_ID` pattern in `src/lib/ankify/access.ts` is the model. Introduce `LIFETIME_PRICE_IDS` (comma-separated env var) and require both `amount >= LIFE_TIME_PRICE` AND `stripe_product_id` in the allowlist before setting `patreon = true`. This closes the price arbitrage without touching marketing copy. The advertised $345–$500 range should be updated in the UI to match whatever Stripe products are in `LIFETIME_PRICE_IDS`.

**Claim 3 — one import limit.**
Reword the free-plan bullet to match code: "Anki → Notion imports up to 1,000 notes each." Adding enforcement (option a — counter column + middleware) is safe but not necessary to fix the honesty gap. Reword first; enforcement can ship separately if the business decides the limit matters.

---

## Files touched

| File | Change |
|---|---|
| `web/src/pages/PricingPage/PricingPage.tsx` | Remove hosted-Anki bullet; reword import limit line |
| `src/routes/WebhookRouter.ts` | Add `LIFETIME_PRICE_IDS` env check alongside amount check |
| `.env.example` (or equivalent) | Document `LIFETIME_PRICE_IDS` variable |
| `web/src/pages/WhatsNewPage/changelog.ts` | One entry: pricing page reflects current features |

---

## Success criteria

- `/pricing` renders with no mention of "Anki desktop in your browser" on the Auto Sync plan.
- A Stripe test webhook for a $96 one-time payment with a non-Lifetime product ID does **not** grant `patreon = true`.
- A Stripe test webhook with the correct product ID and amount ≥ `LIFE_TIME_PRICE` still grants access.
- Free-plan import bullet matches the note cap enforced in `ApkgController`.
- No new TypeScript errors; no new Sonar findings on changed lines.

---

## Out of scope

- Building the hosted Anki serving layer.
- Adding a per-user import counter (enforcement of the one-import limit).
- Changing Stripe product prices or creating new Stripe products.
- Any other copy on `/pricing` beyond the three claims above.

---

## Open questions

1. What are the current Stripe product IDs for Lifetime plans? The env var approach requires at least one ID at deploy time — Alexander needs to supply these before the webhook fix ships to production.
2. Should the advertised Lifetime price on the page change to the lowest price in `LIFETIME_PRICE_IDS`, or stay at the current $345–$500 range once the webhook is fixed?
3. Is the "one import" reword sufficient, or does the business want enforcement before the Marketplace launch?
