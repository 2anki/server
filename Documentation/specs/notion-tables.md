# Spec: Notion tables to Anki

### Trio synthesis
- PM: Tables are the most-requested unsupported block; shipping "one row = one card" turns a frequent dead-end into a working flow for language and STEM users, and the literal Google query ("How to Convert Notion Tables Into Anki Flashcards", issue #1291) maps to a high-intent SEO landing page.
- Designer: No new screen. The card layout already supports rich text on both sides — column 1 in medium weight on the front, column 2 as the back. Add `table` to the Flashcards chip in `/rules` so users can see and toggle the new behavior; add one FAQ row to the new `/convert/notion-tables-to-anki` landing page.
- Engineer: Server-only feature plus one new landing-page copy file. No Python changes, no migration, no new dependencies. Estimated **M** — most cost is fixture coverage and the two integration points in `BlockHandler` (card seeding) and `blockToStaticMarkup` (back-of-card rendering when a table appears inside an existing card).
- Agreement: Ship the renderer + the SEO landing page in the same PR. Column 1 = front, column 2 = back is the only behavior worth defending; treat extra columns as back-body content (joined as a small HTML table) rather than tags, because tag semantics are unclear and Notion users routinely add a third "example sentence" column.
- Conflict: PM initially proposed extra columns → tags (per #2241's "Open questions"). Engineer pushed back — tag inference from arbitrary cell text is noisy and re-opens the strikethrough-tag debate. Resolved by deferring multi-column tagging behind an explicit rules option in a follow-up; v1 puts columns 3..N in the back-body as an inline HTML table.
- Resulting plan: Add `BlockTable.tsx`, register it in `blockToStaticMarkup.ts` and `BlockHandler.ts` (so each `table_row` seeds one card when the parent `table` matches the `flashcard_is` rule), add `table` to the Flashcards chip in `/rules`, and ship `/convert/notion-tables-to-anki` as a fifth landing-page copy file wired into the prerenderer and sitemap.

**Outcome**: Conversion success rate (leading indicator) on pages that contain at least one Notion table moves from "shows `unsupported: table` placeholder" to "produces at least one usable flashcard per `table_row`." Target: 100% of Notion exports with tables produce non-placeholder cards on the first try.

**Goal alignment**: "Simplest, fastest way to turn what you're studying into beautiful Anki flashcards." Vocabulary lists and verb-conjugation tables are how language learners author study material in Notion today — supporting tables removes the single most-cited reason in support threads that a deck comes back broken. Paired with the `/convert/notion-tables-to-anki` landing page, it captures the literal search query users type when they Google the workflow.

**Problem**: A user pastes a Notion page that contains a vocabulary table (column 1: English, column 2: Japanese). The current renderer hits the `default` branch in `src/services/NotionService/helpers/blockToStaticMarkup.ts` and emits `unsupported: table` followed by a pretty-printed JSON dump on every card. The user re-uploads, gets the same result, and either drops the tool or files a support ticket. Issue #235 has been open since v2.0.0 milestone with five upvotes; #2241 is the active ticket; #1291 is the literal Google query, asked twice on YouTube.

**Riskiest assumption**: That Notion's API returns `table_row` cell content as `cells: RichTextItemResponse[][]` (one array per cell, one item per rich-text run), and that the order matches the visible column order in the Notion UI. If cells come back in a different shape or order, the "column 1 = front" contract breaks silently.

**Smallest test**: Before any renderer is wired up, dump one real Notion table via `services/NotionService/_mock/payloads/ListBlockChildrenResponse/` against the current API. Confirm the shape and column order against the Notion docs (`table_row` → `cells`). Fixture lives next to the existing `table_of_contents` fixtures.

**Scope**:

*In:*
- `BlockTable.tsx` renderer that consumes a `table` block + its `table_row` children and emits either (a) one flashcard per row when `flashcard_is` includes `table`, or (b) an inline HTML table when the block appears in the back-of-card body.
- `table` case in `blockToStaticMarkup.ts` — replaces the `default` placeholder.
- `BlockHandler.ts` integration — when a `table` block matches the flashcard rule, walk its `table_row` children and seed one card per row instead of one card per table.
- `table` chip in `flashCardOptions` in `web/src/pages/RulesPage/RulesPage.tsx`.
- New `web/src/pages/LandingPage/copy/notionTables.ts` (path `/convert/notion-tables-to-anki`), wired into `web/scripts/prerenderLandingPages.ts` and `web/public/sitemap.xml`.
- One fixture under `_mock/payloads/ListBlockChildrenResponse/` with a 2-column and a 3-column table.

*Out:*
- Multi-column → tag inference (deferred; see "Out of scope" below).
- Cloze parsing inside table cells (bet 1's scope — do not touch).
- Image cells (bet 2's scope — do not touch).
- Header-row semantics ("first row = column names") — v1 treats the header row identically to data rows; if Notion's `has_column_header: true` flag is set we skip the first row entirely so users don't get a "front: English, back: Japanese" card.
- Python `create_deck.py` changes — the card model already accepts rich HTML.

**User story**: As a language learner who keeps a `English | Japanese` vocab table in Notion, I want every row to become one flashcard (front: English, back: Japanese) so that I can review my whole list in Anki without manually re-typing 200 rows.

**Acceptance criteria**:
- [ ] A 2-column Notion table with N rows produces N cards (or N-1 when `has_column_header: true`).
- [ ] Front of each card = column 1 rich-text rendered with existing annotation handlers (bold/italic/code/links preserved).
- [ ] Back of each card = column 2 rich-text, identical rendering rules.
- [ ] A 3+ column table puts columns 3..N as an inline HTML table in the back-of-card body, below the column 2 content.
- [ ] A table embedded in the back-body of a non-table card renders as an inline HTML table (no card seeding).
- [ ] The `table` chip appears in the Flashcards group on `/rules/:id` and the rule round-trips through the existing rules API.
- [ ] `/convert/notion-tables-to-anki` returns a 200 with the prerendered hero, OG/Twitter meta tags, and at least three FAQ entries, and the URL appears in `sitemap.xml`.
- [ ] Existing fixtures continue to pass — adding `table` to the switch does not regress any other block path.

**Open questions**:
- Should the `table` chip default-on for existing users, or only for new rule rows? (Recommend default-off; existing rules ship without it, the user opts in.)
- Single-column tables — front-only with empty back, or skip the table entirely? (Recommend skip with a debug log; matches the "one row = one card" contract.)

**Out of scope (next iteration)**:
- Per-column rules ("column 3 → tag", "column 4 → deck name") — needs UI work in `/rules` and a schema change; revisit once we see usage data on the basic two-column flow.
- Live re-sync of edited tables — Auto Sync polling already covers this for free; no extra work required.

## Design notes

**User moment**: Right after a user pastes a Notion page link that contains a table. Today: their deck has 1 card per table that says `unsupported: table` with a JSON dump. After this ship: their deck has N cards, one per row, rendered identically to toggle-sourced cards.

**Surface changes**:
1. `/rules/:id` Flashcards chip group — append `table` as the 11th chip, alphabetical-adjacent to `toggle`. No new copy needed; the chip label is the block type, matching every other chip in that group.
2. `/convert/notion-tables-to-anki` landing page — fifth member of the `/convert/*` family. Copy follows the established pattern (h1, subhead, 4 FAQs). Suggested h1: "Notion tables to Anki — one row, one card." Suggested subhead: "Paste a Notion page with a table. Column 1 becomes the front, column 2 becomes the back. Download a .apkg deck."

**Copy strings**:
- h1: `Notion tables to Anki — one row, one card`
- subhead: `Paste a Notion page with a table. Column 1 becomes the front, column 2 becomes the back. Download a .apkg deck.`
- FAQ 1 q: `What if my table has more than two columns?` a: `Columns 3 and beyond show up on the back of the card as a small inline table, below the main answer. Use it for example sentences, mnemonics, or notes.`
- FAQ 2 q: `Does the header row become a card?` a: `If Notion's "header row" toggle is on for that table, we skip it. Otherwise the first row becomes a card like the rest — you can delete it in Anki.`
- FAQ 3 q: `Can I keep using toggles too?` a: `Yes. Tables, toggles, and headings can all source cards from the same page. The Rules page lets you turn each one on or off.`
- FAQ 4 q: `Will images inside cells convert?` a: `Not yet — image-in-cell support is on the roadmap. For now, cells with only an image render as empty; cells with text + image keep the text.`

**No new component, no new design token.** The chip uses the existing `flashCardOptions` rendering; the landing page uses the existing `LandingCopy` template.

**Verdict**: Minor copy + chip work, no new screens. Engineer can ship without further design review.

## Technical pre-flight

**Layers touched**:
- `services/NotionService/` (new renderer + BlockHandler integration)
- `web/src/pages/RulesPage/` (one chip added to `flashCardOptions`)
- `web/src/pages/LandingPage/copy/` + `web/scripts/prerenderLandingPages.ts` + `web/public/sitemap.xml` (SEO landing page wiring)

**Files in play**:
- `src/services/NotionService/helpers/blockToStaticMarkup.ts` — add `case 'table':` calling new `BlockTable`. **Shared file with other parallel bets — coordinate merge order.**
- `src/services/NotionService/blocks/lists/BlockTable.tsx` — new renderer; takes the table block, fetches its `table_row` children via `handler.api`, returns either a flashcard-seeding result or an inline HTML table depending on context.
- `src/services/NotionService/BlockHandler/BlockHandler.ts` — recognize `table` as a flashcard-seeding block when the rule matches; iterate its `table_row` children to produce N cards.
- `src/services/NotionService/blocks/lists/BlockTable.test.tsx` — Jest test for the two shapes (2-col, 3-col) plus the `has_column_header: true` case.
- `src/services/NotionService/_mock/payloads/ListBlockChildrenResponse/<new-uuid>.json` — fixture with a real table + table_row payload.
- `web/src/pages/RulesPage/RulesPage.tsx` — append `'table'` to `flashCardOptions` (line 27-40 in current main).
- `web/src/pages/LandingPage/copy/notionTables.ts` — new file.
- `web/scripts/prerenderLandingPages.ts` — import + add to `LANDING_COPIES`. **Shared file with other parallel bets.**
- `web/public/sitemap.xml` — append `<url>` entry. **Shared file with other parallel bets.**

**Cross-language coordination**: None. The Python `create_deck/` side already accepts whatever HTML the TypeScript pipeline hands it.

**Estimated effort**: **M**.
- Server work is ~150-200 lines including tests.
- Web work is ~50 lines (one chip + one copy file).
- The risk is in the BlockHandler integration — the existing flashcard-seeding loop assumes one block → one card; `table` becomes the first block type where one block → many cards. Need to confirm the existing toggle-with-children path handles this cleanly or adapt it.

**Security/testing/migration**:
- *Security*: No new external calls, no user-supplied paths, no SSRF surface. Cell content already routes through the existing rich-text + sanitize pipeline.
- *Testing*: New `BlockTable.test.tsx`. Fixture-driven so it survives Notion API drift. The `/convert/notion-tables-to-anki` page covered by the existing `prerenderLandingPages.test.ts` shape — add an assertion that the new pathname renders.
- *Migration*: None. The rules row stores `flashcard_is` as a string array, so adding `'table'` to it requires no schema change.

**Coordination flags for parallel bets**:
- Bet 1 (cloze) does not touch tables. No overlap.
- Bet 2 (images) does not touch tables. No overlap.
- `blockToStaticMarkup.ts`, `prerenderLandingPages.ts`, and `sitemap.xml` are shared — coordinate merge order so the last bet rebases against the merged set rather than conflicting at PR time.
