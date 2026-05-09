# Spec: Ankify "next sync" copy clarification

**Goal**: Stop the "when's the next sync?" question by making the polling cadence and (when relevant) the per-database daily export visible on `/ankify`, without new DB columns or per-deck schedule UI.

**Goal alignment**: Trust in freshness keeps Ankify users active week-over-week — directly feeds retention curve toward the 300K-user target in `CLAUDE.md`.

## User-facing change

1. **Page-level helper, rendered once under the "Decks" heading** (not per card). Muted/small text, exact copy:

   > Checks Notion for changes every 5 minutes.

2. **Per-card line 2**, rendered only when there's something deck-specific to say. Rules, in order:
   - If `last_error != null` on the subscription → `Last check failed — we'll try again soon`
   - Else if a daily export schedule is enabled and its `database_id` equals this subscription's `notion_page_id` → `Next export at HH:MM` where `HH:MM` is the user's configured `time_of_day`, formatted in their browser locale's clock style (12h vs 24h via `Intl.DateTimeFormat`, using the schedule's `timezone`).
   - Else → render nothing (no filler).

   Line 1 (`updated <relative>`) stays as-is.

## Files to touch

- `web/src/pages/AnkifyPage/components/NotionSubscriptions.tsx` (around line 300–365): add the page-level helper above the `<ul className={styles.decksList}>`; replace the existing `last_error` red paragraph with the new "line 2" rules described above.
- `web/src/pages/AnkifyPage/AnkifyPage.tsx`: fetch the user's export schedule alongside subscriptions and pass `schedule` down to `NotionSubscriptions` (use existing `GET /api/ankify/exports/schedule` via `get2ankiApi()`; add a thin client method if missing).
- `web/src/styles/...` or component-scoped CSS module: small muted-text helper class if one isn't already available.

No backend changes. No new columns. No new endpoints.

## Data: have vs need (verified)

- `GET /api/ankify/subscriptions` already returns `last_error`, `last_synced_at`, `last_polled_at`, `notion_page_id`, `notion_page_title`, `notion_page_url`. **Sufficient for the error branch.**
- `GET /api/ankify/exports/schedule` already returns `{ database_id, time_of_day, timezone, enabled }` (per-owner, single row). **Sufficient for the next-export branch.** No new endpoint needed; just call it from the page once.
- Caveat: the schedule is keyed by `database_id`, while subscriptions are keyed by `notion_page_id`. The "Next export at HH:MM" line will only appear on a subscription whose `notion_page_id === schedule.database_id` and `schedule.enabled === true`. This is the correct (narrow) match — flag in PR description so reviewers don't expect it on every card.

## User story

As an Ankify user, I want to see how often my decks check Notion and when my next daily export will run so that I trust my flashcards are fresh without asking support.

## Acceptance criteria

- [ ] The "Checks Notion for changes every 5 minutes." helper renders exactly once on the Decks tab, above the deck list.
- [ ] A subscription with `last_error == null` and no matching enabled schedule renders only the existing `updated <relative>` line — no second line.
- [ ] A subscription with `last_error != null` renders `Last check failed — we'll try again soon` as line 2 (replacing the current "Notion couldn't reach this page" copy).
- [ ] A subscription whose `notion_page_id` matches an enabled schedule's `database_id` renders `Next export at <localized HH:MM>` as line 2.
- [ ] When both conditions are true, the error line wins (last-error takes precedence).
- [ ] Vitest unit tests cover the three line-2 branches (none / error / next-export) and assert the page-helper renders once regardless of deck count.
- [ ] No new API endpoints added; no DB migrations.

## Open questions

- Confirm with designer: does line 2 share the same muted/small style as the page-level helper, or should the error variant carry a subtle warning tint (current code uses `styles.decksItemError`)? Default to keeping the existing error styling unless designer says otherwise.

## Out of scope (next iteration)

- Per-deck sync interval controls.
- Adding a `next_run_at` column to `ankify_notion_subscriptions`.
- Refactoring `scheduleAnkifyPolling.ts` or `AnkifyExportScheduler`.
- Surfacing detailed `last_error` messages to users.
- Live countdown timers.

## Commit message guidance

Use `fix(ankify):` or `feat(ankify):` prefix. In the body, explicitly note that broader sync-failure visibility and per-deck error surfacing are deferred future scope so the thread isn't lost — e.g.:

> Future scope (deferred, not in this PR): a fuller error-visibility audit — surfacing actionable `last_error` detail to users and a per-deck retry CTA — would be the natural follow-up if support volume around silent sync failures persists.
