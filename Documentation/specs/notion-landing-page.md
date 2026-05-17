# Spec: dedicated Notion landing page for marketplace traffic

## Problem

Notion Marketplace traffic arrives expecting a native sync experience — "install, connect, Notion syncs to Anki." The current homepage and `/pricing` surface the HTML-export-zip-upload flow, which is the wrong entry point for this audience. 95% of organic traffic lands on `/`, a generic homepage. The May 2026 user spike (15,676 new users) was shaped by Notion's student campaign; marketplace will produce the same traffic pattern but recurring and attributable. The existing flow yields ~1.4% success rate. A dedicated page that leads with sync — not upload — is the lever.

## Goal

A page at `/notion` that converts marketplace visitors into Auto Sync subscribers. Auto Sync ($30/mo) is the default offer; Unlimited ($6/mo) is the downsell for users who prefer manual export. Every action is tagged with `?ref=notion-marketplace` so the marketplace→subscriber cohort is measurable from day one.

**Success criteria:**
- At least one Auto Sync subscription attributed to `ref=notion-marketplace` within 2 weeks of the marketplace listing going live
- Bounce rate on `/notion` below 50%

## Proposed approach

### Route and component

New page `web/src/pages/NotionLandingPage/` (component + Vitest tests). Add `/notion` to the React Router config in `web/src/App.tsx`. Lazy-load via `React.lazy()` — this is not a critical path page.

### Hero

Headline: "Your Notion notes become Anki cards — automatically"  
Subhead: "Connect your workspace in 5 minutes. No exports, no zips, no manual steps."  
Primary CTA: "Connect Notion" → OAuth flow with `?ref=notion-marketplace` appended.

No secondary CTA above the fold. The Unlimited plan is surfaced below as an explicit "prefer to export manually?" escape hatch — it must not compete with the primary action.

### Plan block

Two cards only, in this order:

| Card | Plan | Price | Emphasis |
|------|------|-------|----------|
| Primary | Auto Sync | $30/mo | Automatic sync, no exports |
| Downsell | Unlimited | $6/mo | Manual export, no card limit |

Day Pass, Week Pass, and Lifetime are not shown. They dilute the message and are priced for a different intent.

### Attribution

Every CTA link to Stripe checkout or OAuth includes `?ref=notion-marketplace`. The UTM must be plumbed through:
- GA4 `page_view` and `begin_checkout` events (via the existing analytics wrapper)
- Stripe checkout session metadata (`metadata.ref = "notion-marketplace"`) via `web/src/pages/PricingPage/payment.links.ts`

This lets us run a Stripe query or a GA4 segment to isolate the marketplace cohort on day one.

### Free Ankify tier (open question — see below)

The gate today (`src/lib/ankify/access.ts`, `hasAnkifyAccess`) requires `patreon === true` or an active Auto Sync subscription. Marketplace visitors who are not yet paying hit a wall immediately after OAuth. A narrow free tier — one synced page, ≤50 cards/month — would let users experience value before the paywall. **This is the most important open question for the founder to decide before implementation starts.** If approved, `hasAnkifyAccess` gains a third branch; a migration adds a `free_ankify_usage` counter; and the spec for `access.ts` changes is a follow-up.

If the free tier is deferred, the page must set expectations before OAuth: "Auto Sync requires a $30/mo subscription. Connect to start your trial." (or equivalent honest framing).

## Files touched

| File | Change |
|------|--------|
| `web/src/pages/NotionLandingPage/` | New page component and Vitest tests |
| `web/src/App.tsx` (or router file) | Add `/notion` route, lazy-loaded |
| `web/src/pages/PricingPage/payment.links.ts` | Pass `ref=notion-marketplace` through to Stripe checkout metadata |
| `src/lib/ankify/access.ts` | Only if the free Ankify tier is approved — otherwise no change |

## Out of scope

- Building the Notion Marketplace listing (founder is handling this)
- Reworking `/pricing` (tracked separately as `pricing-page-rework`)
- Building hosted Anki or deck preview
- A/B testing infrastructure (measure via GA4 + Stripe attribution first)

## Open questions

1. **Free Ankify tier for marketplace traffic** — does it exist for this launch, and what are the caps (e.g. one page, ≤50 cards/month)? This is the single decision that changes implementation scope most. Without it, the page must be honest about the paywall before OAuth. With it, `access.ts` and a migration are in scope.
2. What is the exact OAuth entry point URL the marketplace listing should link to? Confirm with the founder before the listing goes live so the UTM is baked in from day one.
