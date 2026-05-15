# Notion search after rules save

### Trio synthesis

- **PM:** Pass a page identifier from `/rules/:pageId` back to `/notion` so the just-edited page is immediately findable without retyping. Target a +15pp lift in "convert that same page within 5 minutes of saving rules" over 14 days post-ship.
- **Designer:** `useSearchQuery` already restores the prior query from `sessionStorage` and from `?q=` on mount. The real bug is no visual confirmation that the save happened and no anchor on the row. Proposed `?saved=<pageId>` + scroll-into-view + 1.5s flash + toast.
- **Engineer:** Smallest viable fix is encoding the page title into `returnTo` at the call site (the link on `/notion` that opens `/rules/:id?returnTo=…`) so that `returnTo` becomes `/notion?q=<encoded-title>`. `RulesPage.goBack` stays a one-line `navigate(returnTo)`. The relevance ranking already surfaces the matched title at position 0 — no scroll-to-row needed. ~5 LOC of production code + one test.
- **Agreement:** `useSearchQuery` already rehydrates. The miss is just guaranteeing that path fires in this specific navigation.
- **Conflict:** Designer wanted confirmation polish (toast + flash + scroll). Engineer rejected as extra complexity for minimal gain. **Resolved** in favor of the engineer's minimal fix — Al's literal report is "trigger new search, can we search for the page we just changed?" which is solved by URL `?q=` alone. The designer's confirmation polish is a separate follow-up: defer until we see whether the minimum fixes the reported problem. If users still report "did my save actually go through?", we add the toast in a second pass.
- **Resulting plan:** Encode the page title into the `returnTo` link as `/notion?q=<encoded-title>` at the call site on the Notion search results. Nothing changes in `/notion` itself — it already reads `?q=` on mount.

---

## Outcome

After saving rules at `/rules/:pageId`, the user lands back on `/notion` with the page they just edited at the top of the search results. They can convert that page in one click without retyping its title.

## Goal alignment

Users who customise rules are our highest-intent cohort. Losing their context at the moment they're investing in the tool is the worst possible time for friction. Fixing this protects retention on the cohort that drives word-of-mouth toward 300K.

## Problem

A user on `/notion` finds a Notion page, clicks through to `/rules/:pageId` to customise its conversion, saves, and is sent back to `/notion`. The search input is empty and the page they just edited is not visible at the top of the results — they have to retype the title to get back to it.

Al's report (2026-05-15): *"when saving rules we just navigate back to http://localhost:3000/notion and trigger new search, can we search for the page we just changed?"*

## Riskiest assumption + smallest test

**Assumption:** users who edit rules want to land back on the same page (to convert it next). If most users edit rules and then immediately go *elsewhere*, the right fix is a convert CTA on the rules page, not a search restoration.

**Test:** scan the last 30 days of conversion logs for users who hit `/rules/:pageId` — check whether their next action is (a) re-finding the same page on `/notion`, (b) searching a different page, (c) abandoning. If (a) is majority, ship as specified. If (b) or (c) dominate, reframe.

One SQL-shaped query against existing logs — no implementation cost.

## Scope

**In:**
- At the call site that builds the `/rules/:pageId?returnTo=…&title=…` link on `/notion` search results, encode the page title into `returnTo` so it becomes `/notion?q=<encoded-title>`.
- One vitest covering the link-building behavior (the URL contains the encoded title).
- One vitest confirming `useSearchQuery` continues to seed from `?q=` on mount (regression guard).

**Out:**
- A new toast or success banner on `/notion` after return (deferred — pure designer polish).
- Scroll-to-row or background-flash on the matched result (deferred — relevance ranking surfaces it at position 0).
- Making the rest of `SearchPage` state URL-bound (filters, pagination, sort).
- Generalising `returnTo` semantics across the app — favourites, card-options, etc. continue to use their own `returnTo` values unchanged.
- Changes to `RulesPage.goBack` itself — it stays a one-line `navigate(returnTo)`.
- A `?saved=<pageId>` parameter that `/notion` would have to handle separately.

## User story + acceptance criteria

As a user customising rules for a specific Notion page, I want to land back on that same page after saving so I can convert it without re-searching.

- [ ] Opening `/rules/:pageId` from `/notion` and saving lands on `/notion?q=<page title>` with the search input pre-filled and the matched page at the top of results.
- [ ] Same behavior on "Reset to defaults" (which also navigates back).
- [ ] Opening `/rules/:pageId` directly (no `returnTo` query) falls back to the current default — `navigate('/notion')` with no query — without a broken redirect.
- [ ] Other call sites that link to `/rules/:pageId` (e.g. from `/card-options`'s Saved-pages list) are unchanged: `returnTo=/card-options` stays exactly that.
- [ ] Vitest covers the `/notion` link-building (URL contains the encoded title) and the `useSearchQuery` mount-with-`?q=` behavior.

## Leading indicator + delta

Among users who open `/rules/:pageId` from `/notion`, the share who convert that same page within 5 minutes of saving rules.

Today's value (estimate): low — requires a re-search step. Target after ship: **+15 percentage points within 14 days**. Below +5pp, the fix is not earning its space; reconsider whether the missing piece is actually confirmation UX (designer's deferred polish), not search context.

## Open questions

1. Where exactly does the `/notion` search result row build the `/rules/:pageId` link today? The engineer pre-flight located it but did not name the file — confirm during implementation. Likely in `web/src/pages/SearchPage/components/` (a row component within `ListSearchResults` or sibling).
2. Notion's page title can change between when we encode it and when the user returns (the user renames the page in Notion mid-flow). If the title we encoded no longer matches anything in Notion's search index, the search returns empty. Acceptable per the spec — `/notion`'s empty state already handles this gracefully — but worth a sentence in the PR body to set expectations.

## Technical pre-flight

**Layers touched:** `web/` only. No server change.

**Files in play:**
- `web/src/pages/SearchPage/components/` — the row component that builds the `/rules/:pageId?returnTo=…` link. Exact file to be confirmed at implementation time (grep for the link template).
- `web/src/pages/SearchPage/helpers/useSearchQuery.tsx` — no edits; this hook already reads `?q=` from the URL with priority over `sessionStorage`. Confirm with a regression test that this behaviour is intact.
- `web/src/pages/RulesPage/RulesPage.tsx` — **no edits**. `goBack()` stays a one-line `navigate(returnTo)`.

**Effort:** S. ~5 LOC of production code + 1–2 vitests. Estimated 30 minutes including running `/check`.

**Security:** The page title is user-supplied text from Notion (a Notion page title can be anything). It is `encodeURIComponent`-wrapped at the call site, then unwrapped by `useSearchQuery` and rendered into `<input value={…}>` and as a text node in the empty-state. React escapes both by default — no reflected-XSS surface. The pattern matches what `SearchPresenter` already does when the user types in the search box.

**Testing:** vitest at the call site (asserts the `/rules/:pageId` link includes the encoded title in `returnTo`); a regression vitest on `useSearchQuery` that mounting with `?q=Organic%20Chemistry` seeds `searchQuery` correctly.

**Migration:** none. No new env vars, no DB changes, no `pnpm kanel`.
