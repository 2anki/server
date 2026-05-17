# Spec: Notion HTML export parser regression sweep

## Problem

Notion's HTML export format drifted in late 2024. The 2anki parser has been silently producing wrong output for over a year. Alexander acknowledged this in r/notion2anki (post 1rcfu6n, Feb 2025): "Last year there was changes to the Notion HTML export format which is affecting us. I have not had time to go through all of them but will hopefully soon."

Three distinct bugs surface repeatedly across the subreddit archive (reviewed 2026-05-18):

**1. Toggle detection broken** (posts 1rcfu6n, 15ndkwz, 177hx8v, 15sgcgf)
Toggles that worked for years now produce 0 or 1 cards, treat every toggle level as a separate top-level card, or skip content entirely. Bulleted-list content inside toggles is treated as empty (post 15sgcgf: "works with plain text, not with dot points").

**2. Images silently missing from generated decks** (posts 18sr1zo, u2hjnl, y9s9yy)
Images render as "invalid path" placeholders in Anki. The zip extraction step is likely not copying images into the Anki media directory, or the HTML `src` attribute does not match the media filename. Pasted screenshots (Ctrl+V into Notion) are especially prone.

**3. Cloze splitting on mixed-formatted spans** (post zyxjht)
Notion emits multiple `<code>` elements when a cloze span contains bold, italic, or colored sub-runs. The parser produces N cloze cards per logical cloze instead of merging them.

## Goal

Fix the three known regressions so that exports matching the reported patterns convert correctly. Each fix is guarded by a fixture-based test so the next format drift fails CI, not users.

## Proposed approach

**a) Reference fixture**
Obtain a fresh Notion HTML export — a small page with: a toggle containing plain text, a toggle containing a bulleted list, an embedded image, a pasted screenshot, and a cloze span with mixed formatting. Save the unzipped export under `src/lib/parser/__fixtures__/notion-html-2024/` as a permanent regression corpus.

**b) Toggle selector audit**
Grep `src/lib/parser/` for `details`, `summary`, `toggle`, `notion-toggle`. Walk the reference fixture DOM to find current element/class names. Update selectors and tree-walk logic to match. Confirm nested toggles and bulleted-list children are included.

**c) Image pipeline trace**
Trace the path from zip entry to `.apkg` media directory. Confirm filenames and `src` attributes agree. Fix any mismatch (URL-encoding, subdirectory stripping, pasted-screenshot filename pattern).

**d) Cloze merge**
In cloze extraction, merge adjacent `<code>` siblings within the same parent element before emitting a single cloze token. The merge must preserve the concatenated text and treat the group as one cloze.

**e) Tests**
Every fix ships with a test that loads the fixture, runs the parser, and asserts card count, image count, and cloze count against expected values. Tests live next to the parser source (`src/lib/parser/*.test.ts`).

## Files touched

- `src/lib/parser/` — selector audit, toggle walk, cloze merge
- `src/lib/parser/__fixtures__/notion-html-2024/` — reference export (new)
- `src/lib/parser/*.test.ts` — regression tests (new)
- `src/lib/ankify/` — image pipeline if packaging happens here

## Success criteria

- A fixture-based test for each of the three bugs passes.
- Card count, image count, and cloze count match expected values in the fixture tests.
- The four reference posts' described inputs no longer produce empty decks, missing images, or split cloze cards.
- No existing passing tests regress.

## Out of scope

- "Could not create a deck" error-message rewrite and upload primer (separate spec `upload-error-and-primer`).
- Parser canary / automated format-drift detection (separate spec `parser-canary`).

## Open questions

- **KaTeX equation rendering** (post 18pyrvo) — Notion exports equations as MathML or image. Anki's support is limited. Flag as future work; do not address in this PR.
- **Riskiest assumption:** the reference fixture will reproduce all three bugs as described. If Notion's current export format has drifted again since the posts, selectors may need a second round after fixture inspection.
- **Scope of image pipeline:** if the image copy runs inside `create_deck/create_deck.py`, coordinated TypeScript + Python changes are required. Confirm during implementation before splitting.
