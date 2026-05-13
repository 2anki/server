# Spec: Study History — AnkiConnect Dashboard

**Outcome**: Power users can open 2anki.net and see their current Anki study streak, today's review count, and 30-day activity without leaving the tab. Target: used by 10% of weekly-active users within 60 days of launch.
**Goal alignment**: Serious Anki users are the highest-LTV segment and the most likely word-of-mouth source toward 300K. A study dashboard makes 2anki.net a daily destination rather than a one-shot converter, increasing retention and surface area for upsell.

## Problem

Users open 2anki.net to create decks, but nothing on the site reflects their actual study life. There is no reason to return after a deck is downloaded. Power users who already have AnkiConnect running (conservatively, the majority of users who install add-ons) get zero value from 2anki.net between conversion sessions.

## Scope

**In scope:**
- A new `/study-history` page, accessible to all visitors (no login required — all data is local).
- A "Study history" sidebar entry in the first `sidebarGroup` in `web/src/components/AppShell/Sidebar.tsx`, below "Anki to Notion", using the existing `ClockIcon` from `web/src/components/icons/ClockIcon.tsx`.
- Five stat tiles and a 30-day review sparkline (layout specified below).
- A connection-state machine: not-configured, Anki closed, connected.
- One-time setup instructions for adding `https://2anki.net` to AnkiConnect's `webCorsOriginList`.
- Lazy-loaded route added to `web/src/App.tsx`.

**Out of scope:**
- Any server involvement. No proxying, no storing stats server-side, no new API routes.
- Auth changes. No login requirement.
- Scheduling, reminders, or push notifications.
- Editing Anki content (adding cards, suspending cards, changing decks).
- Syncing stats to 2anki.net's database.
- Mobile AnkiConnect (AnkiDroid's API is different; defer to a future spec).

## User story

As a dedicated Anki user who has 2anki.net open, I want to see a live summary of my study activity so that I can stay on top of my progress and quickly decide what to convert next.

## Connection flow

All calls go directly from the browser to `http://localhost:8765`. Three states:

**1. Not configured** — shown on first visit (no prior successful ping). Display a two-step setup card:
> "To see your study stats, you need Anki open with the AnkiConnect add-on installed."
> Step 1: Install AnkiConnect (add-on code `2055492159`) from AnkiWeb.
> Step 2: In AnkiConnect settings, add `https://2anki.net` to `webCorsOriginList`, then restart Anki.
> [Retry connection] button.

Store a `studyHistory.configured = true` flag in `localStorage` after the first successful ping, so returning users skip the setup card.

**2. Anki closed** — shown when a ping to `http://localhost:8765` (action: `version`) fails. Display:
> "Open Anki to load your stats." with a [Retry] button. Auto-retry every 10 seconds while the tab is open.

**3. Connected** — show the dashboard (below).

## Dashboard layout

One recommendation. No alternatives.

```
┌─────────────────────────────────────────────────┐
│  Today        Streak    Retention   Mature  Due  │
│  [142 cards]  [21 days] [89%]      [2 4k]  [87] │
├─────────────────────────────────────────────────┤
│  30-day review activity                         │
│  [sparkline bar chart — one bar per day]        │
├─────────────────────────────────────────────────┤
│  Decks                                          │
│  Deck name          New  Learn  Due             │
│  ...                 0     3    12              │
└─────────────────────────────────────────────────┘
```

**The five numbers that matter:**

| Stat | AnkiConnect call | Why it matters |
|---|---|---|
| Reviews today | `getNumCardsReviewedToday` | Daily habit signal |
| Streak | Derived from `getReviewsOfLast30Days` (consecutive days with > 0 reviews, counting back from today) | Retention motivator |
| Retention | From `getCollectionStatsHTML` (parse the "Correct" percentage from the HTML) | Health of the collection |
| Mature cards | `findCards` with query `"is:review"`, count of results | Collection size proxy |
| Cards due | `getDeckStats` for all decks, sum of `due` | Immediate actionability |

The sparkline uses `getReviewsOfLast30Days` (returns `{ "YYYY-MM-DD": count }` map). Render as 30 narrow bars, no axes, no labels. The tallest bar is 100% height; scale the rest proportionally. Use `var(--color-primary)` for bars. A tooltip on hover shows the date and count.

The deck table uses `getDeckStats` (one row per deck). Columns: Deck name, New, Learn, Due. Sort by Due descending. Cap at 10 rows; show "Show all" toggle for the rest.

## Data flow

All AnkiConnect calls are browser-to-localhost. Pattern:

```typescript
const response = await fetch('http://localhost:8765', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action, version: 6, params }),
});
```

Wrap all calls in a single `useAnkiConnect` hook (`web/src/pages/StudyHistoryPage/hooks/useAnkiConnect.ts`) backed by a TanStack Query `useQuery` with `retry: false` and `staleTime: 30_000`. On fetch error, surface the "Anki closed" state. On `result: null` from AnkiConnect, treat as an error.

No `Backend.ts` involvement. No server-side proxy. No credentials.

**CORS setup the user must do:** AnkiConnect defaults to `webCorsOriginList: ["http://localhost"]`. The user must add `"https://2anki.net"` to that list in AnkiConnect's config (Tools > Add-ons > AnkiConnect > Config), then restart Anki. The setup instructions on the not-configured screen must say this explicitly.

## File locations

| File | Purpose |
|---|---|
| `web/src/pages/StudyHistoryPage/index.tsx` | Lazy export |
| `web/src/pages/StudyHistoryPage/StudyHistoryPage.tsx` | Page shell, connection state machine |
| `web/src/pages/StudyHistoryPage/hooks/useAnkiConnect.ts` | Single TanStack Query hook wrapping all AnkiConnect calls |
| `web/src/pages/StudyHistoryPage/components/SetupCard.tsx` | Not-configured and Anki-closed states |
| `web/src/pages/StudyHistoryPage/components/StatTiles.tsx` | Five-number row |
| `web/src/pages/StudyHistoryPage/components/Sparkline.tsx` | 30-day bar chart |
| `web/src/pages/StudyHistoryPage/components/DeckTable.tsx` | Per-deck breakdown |
| `web/src/pages/StudyHistoryPage/StudyHistoryPage.module.css` | Page-scoped styles using existing design tokens |

Route in `web/src/App.tsx`: `<Route path="/study-history" element={<StudyHistoryPage />} />` — no `requireAuth` wrapper.

Sidebar entry in `web/src/components/AppShell/Sidebar.tsx`: add after the "Anki to Notion" row, always visible (no feature flag, no login gate).

## Acceptance criteria

- [ ] Visiting `/study-history` without Anki running shows the "Anki closed" state with a Retry button.
- [ ] Visiting for the first time (no `studyHistory.configured` in localStorage) shows the two-step setup card.
- [ ] After a successful connection, the five stats render within 2 seconds on a warm AnkiConnect instance.
- [ ] The 30-day sparkline renders with one bar per day; hovering a bar shows the date and review count.
- [ ] The deck table shows New / Learn / Due columns, sorted by Due descending.
- [ ] The page is accessible without login.
- [ ] The sidebar entry is visible for all users (logged in or not) and navigates to `/study-history`.
- [ ] No network requests go to 2anki.net's server from this page.
- [ ] Vitest unit tests cover `useAnkiConnect` error states and the streak-derivation logic.

## Open questions

1. Should the retention figure be parsed from `getCollectionStatsHTML` (fragile HTML scraping) or is there a cleaner AnkiConnect action for it? If parsing proves brittle, drop retention from v1 and replace with "young cards" count from `findCards` with `"is:young"`.
2. AnkiConnect v6 vs v5 compatibility: the spec targets v6 (`version: 6`). If a user has an older add-on, `getNumCardsReviewedToday` may not exist. Detect via the `version` ping and show an "Update AnkiConnect" prompt if below 6.

## What NOT to build (explicit deferral)

- **Scheduling features** — no "study reminder" or "goal setting". This is a read-only view.
- **Server-side stat storage** — no new DB tables, no analytics aggregation.
- **AnkiDroid / AnkiMobile** — those APIs differ; scope separately.
- **Deck management** — no add/delete/rename cards or decks from this page.
- **Historical trends beyond 30 days** — AnkiConnect's `getReviewsOfLast30Days` is the ceiling for v1.

## Future hooks

This page is the first step toward a "close the loop" story: a user sees that their Japanese vocabulary deck has gone stale (low due count, no recent reviews), then clicks through to create a new set of cards from their Notion notes — converting a passive stat view into an active conversion session. The `DeckTable` component is the natural place to add a "Create cards for this deck" CTA in a future iteration, linking to the Notion search page pre-filtered by deck name. That connection — study data driving content creation — is the moat that separates 2anki.net from a one-shot file converter.
