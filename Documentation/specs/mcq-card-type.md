# Spec: first-class MCQ card type

**Status:** draft · **Owner:** Alexander · **Target:** v1 ship in single PR

## Problem

Med students (the heaviest power-user segment) want their Notion-authored practice questions to convert into interactive Anki cards that look like the question banks they already use — vignette → click an option → correct one highlights green → explanation reveals. 2anki today only emits Basic + Cloze cards from toggles; there is no MCQ pipeline. The closest path is hand-shaped HTML, which defeats the purpose of the converter.

Source signal: Farah (medical student, WhatsApp via Alexander) — "more mcqs deck need in your website / Multiple choice questions / Not simple user needs attractive" — with two screenshots of a USMLE-style 7-option MCQ in Anki.

## Goal alignment

- "Beautiful Anki flashcards" + "300K users." Med students are the largest growth lever; their dominant artifact is the clinical-vignette MCQ.
- Competitive: RemNote ships MCQs first-class; no OSS Notion-to-Anki converter does. 2anki would be first in this category.

## v1 scope

Single-correct, text-only MCQs with 2–7 options. One stem, N options, one correct answer, one explanation block. Detection runs on every upload; if no MCQ shape is found, the badge doesn't render and behavior is unchanged.

**Non-goals (deferred to v2+):** multi-correct, image-in-option, MCQs from non-Notion sources (markdown / xlsx / .apkg), per-deck template customization, AnKing-deck import, AI-generated distractors, settings toggle to disable detection, drag-to-reorder, dark-mode override, AMBOSS-style hyperlinked term glossary.

## Notion-side authoring convention

A **toggle** whose title is the stem; children are the options. The correct option is marked by one of two signals (in precedence order):

1. **Primary — Notion `to_do` block with `checked: true`.** Semantic, unambiguous, parseable directly from the Notion API (`block.to_do.checked`) and from the HTML export (`<span class="checkbox-on">`).
2. **Fallback — bulleted list item with the option text bolded.** Zero learning curve, survives copy-paste from Word/Docs, uses existing rich-text annotation parsing.

The explanation is any non-bullet content inside the toggle (paragraph, quote, callout) and is preserved as-is on the back.

**Failure modes that fall back to today's Basic/Cloze behavior (no MCQ card generated):** zero markers found in an otherwise MCQ-shaped toggle, ≥2 markers (ambiguous), only one option. Failures surface in the conversion result badge — they do not crash the upload.

## Card visuals (v1)

Vendor `anki-boi/True-Anki-MCQ-Note-Template` (MIT, ~940 lines: `front.html` + `back.html` + `styling.css`). Use as-is for v1 — the visual pass to match AMBOSS aesthetic ships in v2.

- **Front:** stem (16px, weight 400, 1.6 line-height), 1.5rem gap, vertical option list — each row is an outlined 20px checkbox + letter label (A–G, weight 500, `--color-text-muted`, tabular-nums, 1.5rem fixed width) + option text. Mobile (375px): option text wraps under the label.
- **Back:** same layout. Correct row gets `#ECFDF5` background, 6px radius, 1.5px `#10B981` left rule; checkbox becomes a filled green circle with a white check. Below options: "Explanation" section heading (weight 600, 0.875rem, uppercase, 0.05em tracking) + body with a 3px left rule and 1rem left padding. Hyperlinks in `--color-link`.

## UI surface

When the parser detects MCQs in an upload, the existing deck-card on the results page gains a badge next to the card count: **{n} multiple choice**. Clicking the badge opens an inline drawer (not a modal) showing the first MCQ rendered front-side, with a **Show answer** / **Show question** toggle. No new settings, no per-card editor, no opt-in.

If the parser sees MCQ-shaped toggles but couldn't determine the correct answer for some of them: append `— {n} skipped, no answer marked` to the badge. Tooltip on the skipped count: **Mark the correct option in Notion to render these as multiple choice. Use a Notion checkbox or bold the correct bullet.**

Copy (sentence case, no trailing period, per VOICE.md):
- Badge: `{n} multiple choice`
- Drawer heading: `Preview`
- Toggle: `Show answer` / `Show question`
- Skipped line: `{n} skipped, no answer marked`

## Implementation

Pipeline touches three files in `src/lib/parser/` and one in `src/templates/` plus two in `create_deck/`:

1. **`src/lib/parser/findNotionToggleLists.ts`** — add `isMCQ(element, dom)` predicate that returns the index of the marked option (or `-1`). Inspects (a) `<span class="checkbox-on">` children of toggle list items, (b) bolded `<strong>` annotations on bulleted children.
2. **`src/lib/parser/Note.ts`** — add `mcq: boolean`, `options: string[]`, `correctIndices: number[]` fields (multi-correct shape now to keep v2 cheap; v1 always emits a single index). Add `isValidMCQNote()`; include in `Deck.CleanCards` filter.
3. **`src/lib/parser/DeckParser.ts`** — extend `extractCards()` so MCQ-classified toggles build an MCQ `Note` instead of a Basic one.
4. **`src/templates/n2a-mcq.json`** — new note-type template with fields `[Question, Options, CorrectAnswer, Extra]`; inline `front.html` + `back.html` + `styling.css` from True-Anki. Mirrors the existing `n2a-basic.json` shape.
5. **`create_deck/helpers/get_model.py`** — register `"mcq"` in `MODEL_INFO`.
6. **`create_deck/create_deck.py`** — `build_one_deck` selects the MCQ model when `card.get('mcq', False)`; passes `[question, options_html, correct_answer, extra]`.

No feature flag — the detection is structural and non-breaking (toggles without markers behave exactly as today). No DB migration.

## Test plan

Outside-in via `src/lib/parser/DeckParser.test.ts` with new fixtures under `__fixtures__/`:

1. **Happy path:** toggle with four `to_do` children, one `checked` → MCQ `Note` with `options.length === 4`, `correctIndices === [<checked index>]`, passes `isValidMCQNote()`.
2. **Happy path — bold fallback:** toggle with four bulleted children, one fully bolded → same shape as above.
3. **Edge — missing correct marker:** toggle with four unchecked `to_do` blocks → emits Basic note (today's behavior); badge shows `1 skipped`.
4. **Regression — existing fixtures unchanged:** `Nested Toggles.html` and other current fixtures yield identical card counts and `mcq === false` on every note.

Add the new MCQ fixture to `src/lib/parser/canary/` so Notion HTML markup drift surfaces in the daily canary email before it reaches users.

## Success metric

Leading indicator: **≥150 MCQ cards generated across ≥20 distinct uploaders in the first 14 days** post-launch. Measured by counting MCQ-typed notes in generated `.apkg` files (already logged per-conversion). Below that, demand was overstated by one vocal user; above it, prioritize v2 (multi-correct + image options).

## Riskiest assumption + smallest test

**Assumption:** med students authoring practice MCQs in Notion will use either `to_do` blocks or bold for the correct option — not numbered lists with `(C)` annotations or tables.

**Falsifier test (before writing the parser):** grep the last 500 successful Notion conversions for toggles whose children are bulleted/to_do lists. What % already match one of our two markers? <5% means the convention is wrong and the spec needs a written marker (e.g. `[correct]`). One afternoon of log analysis, zero code shipped.

## Rollout

Single PR. No flag. Ship behind the existing free conversion flow — not gated by Ankify. Post-launch: monitor the success metric for 14 days, then revisit v2 scope.

## Out of scope (will not be in the implementation PR)

Designer styling pass to match AMBOSS aesthetic exactly — v1 ships True-Anki's template untouched, then we iterate based on real user reactions in v1.1.
