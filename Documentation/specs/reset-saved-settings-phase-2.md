# Reset saved settings — Phase 2

### Trio synthesis

- **PM:** New `/settings` page with two sections (Defaults + Saved per page); per-row delete only, **no bulk reset endpoint** (footgun for the long-tail user); defer the Toast primitive as its own infra ticket.
- **Designer:** **Extend the existing `/card-options` Saved-pages list** instead of building a parallel `/settings` page — users already think of `/card-options` as "where my saved stuff lives". **Ship bulk reset** in a quiet footer with a `modalCardNarrow` confirm dialog showing the explicit count. No Toast — reuse the existing `alertSuccess` strip. Single-row Reset stays unconfirmed; bulk gets a confirm.
- **Engineer:** List data + plumbing already exists (`GET /api/settings/list`, `Backend.listSettings()`) — no UI renders it yet. Bulk endpoint is ~4 files (`DELETE /api/users/me/settings` → repo `deleteAll(owner)` + use case + controller + route). Toast is 60–80 LOC greenfield. Undo via client-side deferred fire is far cheaper than a soft-delete column.
- **Agreement:** The per-page list UI is the Phase 2 surface. Toast primitive is deferred — `alertSuccess` is the v1 safety net. Per-row Reset reuses the Phase 1 endpoints. Implementation gated on the Phase 1 leading indicator.
- **Conflicts:** PM wanted a new `/settings` page; designer wants `/card-options` extended. **Resolved** in favor of extending `/card-options` — new routes for list-row affordances is over-scope. PM did not want bulk reset; designer wants it shipped. **Resolved** in favor of shipping — designer's footer placement + confirm dialog with explicit count handles the footgun concern, and the engineer confirmed the cost is small.
- **Resulting plan:** Per-row Reset action on the existing `/card-options` list (reusing Phase 1 endpoints) + `DELETE /api/users/me/settings` bulk wipe with footer button and confirm dialog. No Toast, no undo. Gated on Phase 1's 50+ deletes/week indicator clearing by 2026-06-15.

---

## Outcome

A user with stale per-page overrides can find and clear them in one place — without remembering which pages they customised. Returning uploaders stop getting unexpected decks from rules they set months ago and forgot.

## Goal alignment

Returning uploaders are the cheapest path to 300K — they are already past acquisition cost. The silent-churn moment where a returning user converts a page, gets unexpected output from a forgotten override, and assumes 2anki is broken is the failure this addresses.

## Problem

A user converts a Notion page in January with custom parser rules. In May they convert a different page and the January rules silently apply because the page ID matches a saved entry they forgot existed. Phase 1 lets them reset *one page they're currently looking at*. It does not help the user who does not remember which pages have overrides.

## Riskiest assumption + smallest test

**Assumption:** users want a list of their saved per-page settings. If <50 deletes/week land via the Phase 1 endpoints by 2026-06-15, the assumption is wrong — most users only ever care about the page in front of them, and a list UI is overhead nobody asked for.
**Test:** the Phase 1 leading-indicator gate. Do not start Phase 2 implementation until the gate clears.

## Scope

**In:**
- **Per-row Reset action** on the existing `/card-options` Saved-pages list. Reuses `DELETE /api/rules/:id` + `POST /api/settings/delete/:id` from Phase 1. No new per-row endpoint.
- After a row is reset, it stays in the list — timestamp replaced with a faint **"Using defaults"** label so the user sees the action took effect without losing the row.
- **Bulk "Reset all saved pages"** button in the footer of the Saved-pages section. Hidden when the list is empty. Tertiary placement.
- New `DELETE /api/users/me/settings` — owner-scoped wipe of all per-page parser rules + per-page card-option overrides. Idempotent (204 even when the user has no rows).
- Bulk action requires a `modalCardNarrow` confirm dialog with the explicit count baked into the CTA (`Reset 12 pages`).
- `alertSuccess` strip on success (single or bulk); `alertDanger` on failure.
- Vitest covers list render with row Reset, empty state, single-row reset state shift, bulk confirm dialog flow, error rollback.

**Out:**
- A new `/settings` route. Phase 2 lives inside `/card-options`.
- Toast primitive + 5-second undo. Carve off as `feat/toast-primitive` if/when a second destructive action needs the same affordance.
- Per-field reset granularity ("reset only the deck name, keep the template"). Zero evidence of this need.
- Reset of `theme` or `ankiWebAcknowledgedAt`. Not the user pain.
- Pagination beyond client-side rendering. Even at 500 saved pages the list is small enough; revisit if the 99th-percentile user crosses 1k.

## User story + acceptance criteria

As a returning uploader, I want to see every per-page setting I have saved so I can clear the ones I do not recognise.

- [ ] `/card-options` Saved-pages list now renders a Reset action per row, in addition to the existing Notion link.
- [ ] Clicking row Reset calls `DELETE /api/rules/:id` and `POST /api/settings/delete/:id` in parallel and replaces the row's timestamp with **"Using defaults"** in place. No row removal.
- [ ] Footer "Reset all saved pages" button is visible whenever the list has at least one row, hidden otherwise.
- [ ] Clicking the bulk button opens a `modalCardNarrow` confirm with copy: *"<N> pages will go back to your defaults. Per-page options and parser rules are removed. You can re-save any page individually."* and CTA *"Reset <N> pages"*.
- [ ] Confirming bulk fires `DELETE /api/users/me/settings`, then refreshes the list (which renders the empty state).
- [ ] `DELETE /api/users/me/settings` returns 204 whether the owner had 0 rows or many. Owner-scoped at the repository layer (parameterised `WHERE owner = ?`).
- [ ] Per-VOICE.md inline error on any failure: *"Couldn't reset. Try again."* (single row) / *"Couldn't reset all pages. Some may have been reset — refresh to check."* (bulk).
- [ ] Bulk button disabled while any per-row action is pending (prevents racing the bulk mid-row-delete).

## Leading indicator + delta

Track `/card-options` Saved-pages section interactions and per-row + bulk delete counts. Target within 30 days of Phase 2 ship: **30% delete-through rate among users who view the list** (baseline 0% — list affordance does not exist today). Below 15%, the list is not earning its space — collapse the per-row Reset action and re-evaluate.

## Open questions

1. Notion title cache — `/card-options` already renders titles for saved pages today via `listSettings`. Confirm the title is fresh enough that users recognise old pages, or whether a re-fetch on list mount is worth the latency cost.
2. Bulk endpoint scope — does "Reset all saved pages" cover both `parser_rules` AND the per-page `settings` table, or only one? Recommend both, in a single transaction, since the row Reset already wipes both.
3. Should the bulk modal show the actual page titles (top 5, then "+7 more") or just the count? Designer to call.
