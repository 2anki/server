# Spec: pricing page hierarchy and plan-mix rework

**Date:** 2026-05-18  
**Status:** Draft  
**Trio sign-off:** PM + Designer agreed on approach below

---

## Problem

`/pricing` renders six plans (Free, Day Pass, Week Pass, Unlimited, Auto Sync, Lifetime) at equal visual weight in a flat grid. Auto Sync — the highest-revenue plan and the most relevant offer for incoming Notion Marketplace traffic — sits fourth, after two pass plans most visitors will never buy. Several copy strings violate VOICE.md: filler intros, hedge phrases, and a "$345–$500" range that soft-sells the Lifetime anchor.

---

## Goal

Make Auto Sync and Unlimited the two things visitors see first. Reduce visual noise from the pass plans without hiding them permanently. Fix every copy violation in a single pass. Measure success as Auto Sync subscription starts attributable to `/pricing`.

---

## Proposed approach

### Layout

1. **Free one-liner** — sits above the paid block, visually distinct (muted background, no card shadow). Single "Start free" CTA. The "100 cards per month" marketing string is PROTECTED per VOICE.md and must not change.

2. **Two anchor cards** — full-height, side by side, equal width:
   - Left: **Unlimited — $6/mo** — badge "Most popular"
   - Right: **Auto Sync — $30/mo** — badge "New — built for Notion", raised surface (accent border + shadow token; see _Files touched_)

3. **Pass row** — a single muted line below the anchor cards:  
   "Need just a weekend? Day Pass $4 · Week Pass $9 · Lifetime from $345"  
   Each item is a link that expands an inline accordion showing full plan bullets. Week Pass is hidden behind the accordion on launch (reversible — see _Plan-mix call_ below).

### Copy deltas

| Location | Before | After |
|---|---|---|
| Unlimited card badge | "Best for most" | "Most popular" |
| Auto Sync card badge | "New" | "New — built for Notion" |
| Page intro | "Pick your pass / Have a deadline this weekend?..." block | Delete entirely |
| Day Pass + Week Pass cards | "Starts the moment you pay" (appears twice) | Delete both instances |
| Lifetime price display | "$345 – $500" | "From $345" |
| Support blurb | "we usually reply within a day" | "Reply within 24 hours." |
| Page closing line | existing text | "Free works forever. Paid plans support 2anki.net." |

### Plan-mix call

Week Pass is hidden behind the accordion on launch. After 2 weeks, check pass revenue:
- If Week Pass revenue drops more than 20%: restore it to a visible position.
- If it does not: remove Week Pass from the product entirely (PM recommendation — confirmed by designer).

This gives a reversible A/B signal without a feature-flag system.

---

## Files touched

| File | Change |
|---|---|
| `web/src/pages/PricingPage/PricingPage.tsx` | Restructure layout: Free one-liner → two anchor cards → pass accordion row |
| `web/src/pages/PricingPage/index.tsx` | Update exports if component split changes |
| `web/src/pages/PricingPage/components/AutoSyncCard.tsx` | Update badge copy; apply raised-card CSS token |
| `web/src/pages/PricingPage/components/PassCards.tsx` | Wrap in accordion; hide Week Pass by default |
| `web/src/pages/PricingPage/components/PricingCard.tsx` | Update badge copy for Unlimited |
| `web/src/pages/PricingPage/PricingPage.module.css` | Anchor card layout, pass row typography, accordion styles |
| `web/src/pages/PricingPage/payment.links.ts` | Update Lifetime display string to "From $345" |
| `web/src/pages/PricingPage/pricing.constants.ts` | Update badge labels and any copy constants |
| `web/src/styles/shared.module.css` | Add `raised-card` and `accent-border` tokens for Auto Sync card |

---

## Success criteria

- **Primary:** Auto Sync subscription starts attributable to `/pricing` increase week-over-week within 14 days of ship. Query: `subscriptions` rows with `stripe_product_id = AUTO_SYNC_PRODUCT_ID` where `created_at >= ship_date`.
- **Guardrail:** Day Pass revenue does not drop more than 10% over the same window (pass plans still reachable via accordion).
- **Copy:** Zero remaining VOICE.md violations on `/pricing` confirmed by designer sign-off before merge.
- **Week Pass signal:** measure Week Pass-specific subscription starts for 14 days to inform the kill/keep call.

---

## Out of scope

- Dedicated `/notion` landing page — separate spec.
- Auto Sync hosted-Anki copy fixes — separate spec (`pricing-honesty`).
- Stripe plan pricing changes — any price changes require explicit approval outside this spec.
- Analytics instrumentation beyond what already fires on subscription start.

---

## Open questions

1. Does the accordion need a keyboard/accessible expand interaction, or is a plain `<details>`/`<summary>` element sufficient? Designer to confirm before implementation starts.
2. Should the Free one-liner link to `/register` or stay as a scroll-anchor on the page? Current behavior is a Stripe-free sign-up — confirm the CTA destination matches.
3. "Lifetime from $345" — does this surface the lowest tier or should it call out the single current Lifetime SKU? PM to confirm which Stripe product maps to $345.
