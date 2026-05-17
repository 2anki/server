# Spec: Surface Ankify from upload + limit states

**Date:** 2026-05-18
**Status:** Draft

---

## Problem

Users have asked for Notion → Anki one-way sync for five years (r/notion2anki: 2021, 2023, April 2025). The product that answers this — Auto Sync ($30/mo) — exists but zero recent community posts mention Ankify by name. It is invisible at every moment a user would buy it.

Two intent signals in GA4 (last 12 months):

- `/login?error=upload_limit_exceeded` — 688 sessions
- `/pricing?error=upload_limit_exceeded` — 177 sessions

These users hit the free-tier wall and landed on a generic pricing page that lists Auto Sync at position 4. Users who just exported from Notion and are uploading HTML see nothing that connects the two steps.

---

## Goal

Surface Auto Sync to users who already want what it does, at the moment they want it. No new audience, no new messaging — only closing the gap between intent and discovery.

Primary metric: Auto Sync subscription starts attributed to one of these surfaces within 30 days of launch > 0.
Secondary metric: click-through rate on the limit-page Auto Sync CTA > 5%.

---

## Proposed approach

### 1. Upload-screen banner for Notion-connected users

When a user has a connected Notion OAuth token and is uploading an HTML export, show a single dismissable banner:

> "You exported this from Notion — Auto Sync would re-export automatically every 5 minutes."  [Try Auto Sync →]

Rules:
- Suppressed if the user already has Auto Sync (`hasAnkifyAccess` returns true).
- Dismissed state stored in a cookie (30-day TTL). Does not nag on every upload.
- Does not appear for non-Notion uploads (markdown, xlsx, zip).

### 2. Upload-limit `/limit` page (new route)

Replace both redirect targets (`/login?error=upload_limit_exceeded` and `/pricing?error=upload_limit_exceeded`) with a new `/limit` page.

The page:
- Names the specific limit hit with the actual number ("You reached 100 cards this month").
- Shows two options side-by-side: **Unlimited** ($6/mo) and **Auto Sync** ($30/mo — "never re-upload again").
- Does not show all five paid plans. Two choices, one decision.

Voice: specific, no apology. "You reached 100 cards this month" not "Oops, you hit the limit!"

### 3. Post-success prompt

After a successful conversion (success page), display a one-line prompt below the download button:

> "Want this to update automatically? Try Auto Sync."

Rules:
- Shows once per user per calendar month (persisted server-side, not localStorage).
- Not shown to users who already have Auto Sync.

---

## Files touched

| File | Change |
|---|---|
| `web/src/pages/LimitPage/` | New page and route for `/limit` |
| `web/src/pages/UploadPage/` | Add conditional Notion-connected banner |
| `src/controllers/UploadController.ts` | Redirect to `/limit` instead of `/login` or `/pricing` |
| `src/lib/ankify/access.ts` | Read-only — gate banner + prompt on `hasAnkifyAccess` |
| `web/src/App.tsx` | Register the new `/limit` route |

---

## Success criteria

- At least one Auto Sync subscription start attributed to the banner, limit page, or post-success prompt within 30 days of launch.
- Limit-page Auto Sync CTA click-through rate > 5%.
- No spike in "stop nagging me" support email volume.

---

## Out of scope

- Pricing-page rework (separate spec: `pricing-page-rework`).
- Free Ankify tier decision (separate spec: `notion-landing-page`).
- Notion Marketplace onboarding flow.
- Changes to the $30/mo price point or plan structure.

---

## Open questions

1. **Banner noise vs. conversion.** If the Notion-connected banner suppresses more free-tier goodwill than it generates in upgrades, pull the banner and keep the limit-page redesign. The limit page is a pure improvement regardless; the banner is the riskier touch. Launch with both, watch support volume for two weeks.

2. **Post-success prompt server state.** "Once per user per month" requires a DB column or a lightweight key-value store. Confirm the right data layer before implementation — a migration is needed.

3. **Attribution.** The limit page and banner need `?ref=` parameters on the Auto Sync CTA link so GA4 can distinguish which surface drove the conversion. Agree on the ref values before shipping.
