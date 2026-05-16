# Spec: Google Doc card generation (switch to docx export)

**Outcome**: Native Google Docs picked from the Drive picker produce decks with non-empty backs and meaningful card counts. Target: median cards-per-Doc ≥ 3 for outline-shaped docs; empty-back rate < 5% on Google-Doc-sourced decks (today: 100%).
**Goal alignment**: Drive is the second-largest non-Notion source; if Docs don't produce usable decks, the source is decorative. Fixing this defends the Drive launch's contribution to the 300K-user goal.
**Problem**: Al picked a Google Doc with two Q/A bullet groups (PR #2309/#2310). The HTML export contains no `<ul>`/`<li>` — bullets are `<p>` + nbsp + `•`. DeckParser walked the paragraphs and produced 7 cards with empty backs. Total user value: 0.
**Riskiest assumption**: That a typical study-notes Google Doc (outline of bullets, headings + bodies) survives a `mammoth` docx → HTML round-trip with semantic `<ul>/<li>` / `<h1>` preserved, well enough for DeckParser's existing `extractCardsFromLists` and `convertHeadingsToToggles` (in `preprocessDocxHTML`) to produce meaningful Q/A pairs.
**Smallest test**: Take Al's failing doc, export as docx via the Drive API, pipe through `convertDocxToHTML`, run through DeckParser. If it produces ≥ 2 cards with non-empty backs, the assumption holds. ~15 minutes including curl.

**Scope (in)**
- `NATIVE_GOOGLE_APPS_EXPORT_MIMES['application/vnd.google-apps.document']` changes from `text/html` (`.html`) to `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (`.docx`). One literal edit in `src/controllers/Upload/helpers/createGoogleDriveDownloadLink.ts`.
- Existing `isDocxFile` check in `PrepareDeck.ts` already routes `.docx` through `convertDocxToHTML` → `preprocessDocxHTML` (which already produces `<details><summary>…</summary>…</details>` from heading + body, and from lists). No parser changes.
- Empty-deck error state on the upload page: when a Google-Doc upload produces 0 cards, show a one-line link to the help page (does not exist yet — see "out of scope"). For this PR, ship the docx switch only and rely on the existing empty-deck UI.
- New server test: `createGoogleDriveDownloadLink.test.ts` assertion that native Doc mime → `.docx` extension + docx export mime.
- Update `handleGoogleDrive.test.ts` to cover the docx branch with a 2-card mammoth fixture.

**Scope (out, explicitly)**
- No Google-Docs-HTML-specific parser (option B). If docx works for 80% of docs, the bespoke parser is dead code we'd have to maintain. Revisit only if option A scores < 50% useful-deck rate after one week of real traffic.
- No `guessMarkdownCards`-on-HTML safety net (option C). Adds a second code path with no metric to tune against until A ships and produces data. Park as a fast-follow if A under-delivers on heading-only docs.
- No Claude/AI path. This is the cheap deterministic lane; the AI lane is the Ankify product, gated separately.
- No "choose your export format" UI. The user picks a Doc; the server picks the format.
- No new help page in this PR (see "next iteration").

**User story**: As someone with study notes in Google Docs, I pick my doc in the Drive picker and get back a deck where each top-level bullet (or heading) is a question and the nested content underneath is the answer — without converting to .docx myself first.

**The shape we teach (when the help page lands, next iteration)**: Two patterns, both already supported by `preprocessDocxHTML`:
1. **Heading + body**: H1/H2/H3 becomes the question; the paragraphs and lists that follow until the next heading become the answer. Most natural for Doc users.
2. **Outline bullets**: top-level bullet = question, indented sub-bullets = answer. Familiar to anyone who has used the Notion path.

**Acceptance criteria**
- [ ] `NATIVE_GOOGLE_APPS_EXPORT_MIMES['application/vnd.google-apps.document']` exports `.docx`.
- [ ] Al's test doc (two Q/A bullet groups) produces ≥ 2 cards with non-empty backs.
- [ ] A heading + body doc (one H2 + one paragraph) produces ≥ 1 card with non-empty back.
- [ ] `handleGoogleDrive.test.ts` covers the docx branch (URL + filename + downstream conversion).
- [ ] Changelog entry: `Google Docs from your Drive convert into outline-shaped decks — top-level bullets become questions, indented bullets become answers.`

**Metrics**
- **Leading (new):** `cards_per_doc` — median cards produced from a Google-Doc upload, bucketed by week. Logged at the end of `handleGoogleDrive` alongside the existing `conversion_success` counter. Target ≥ 3 by end of week 1.
- **Leading (existing):** Drive `conversion_success` rate — should stay flat or rise; a drop means the docx path is breaking on docs the html path silently ate.
- **Lagging:** Drive-sourced uploaders who return within 7 days.

**Where we teach the shape** (decision, not in this PR)
- **Yes**: a help link on the empty-deck error state, only when the source was a Google Doc. Voice (per VOICE.md): "0 cards from this Doc. Format your notes as headings + paragraphs, or as bullet outlines. See examples."
- **No**: a tooltip or pre-flight checklist on the upload form. Doc users come from the picker; they aren't reading the form copy. Teach at failure time, not upfront.
- **No**: a toast on success either. The deck downloading is the feedback.

**Open questions**
- Does mammoth preserve Google Docs' multi-level bullet indentation as nested `<ul>`? If yes, DeckParser's nested-list path produces good cards. If no (flat `<ul>`), we still get heading + body cards but lose the outline-only doc shape. Smallest test answers this in 15 minutes.
- Does `files.export` return a `Content-Type` header consistent with the requested mime, or does `instrumentedAxios` need to re-check? Existing `arraybuffer` response handling does not depend on the content-type, so likely no change — verify in the test.

**Out of scope (next iteration)**
- A `/help/google-docs` page with the two patterns above and one screenshot of each.
- Wiring an empty-deck error state to that help link, sourced-tagged ("your Google Doc produced 0 cards").
- Option C (`guessMarkdownCards` over HTML-stripped-to-text) as a third-tier fallback if `cards_per_doc` median sits below 3 after one week.

**Layer impact**: `controllers/Upload/helpers/` only. No `usecases`, `services`, or `data_layer` change.
