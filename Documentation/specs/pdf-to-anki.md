# PDF → Anki input

## Problem

Medical students are the densest concentration of Anki power users globally, and they live in PDFs: lecture slide decks, First Aid, Pathoma, UWorld notes, board prep books. The current product accepts Notion, zip, HTML, markdown, CSV, and apkg. PDF parsing exists but is gated to Unlimited ($6/mo) and converts to images only — quality is uneven and the feature is not positioned as a selling point. Becoming the trusted "drop your PDF, get a clean deck" product is a 10–50x TAM expansion over Notion exporters alone.

## Goal

A 30-page med lecture PDF produces a usable deck in under 60 seconds. A 200-page board prep PDF is navigable via page-range selection. AI mode produces Q/A pairs a med student recognizes as a usable first draft without manual cleanup. Cost per upload stays below $0.50 at Claude pricing as of 2026-05.

## Proposed approach

Three layers, all in scope for v1:

**1. Extraction quality**

Replace image-only conversion with text + structure extraction using `pdf-parse` or `pdfjs-dist` (evaluate both against the reference corpus before picking). Preserve: page boundaries, headings, bullet lists, bold/highlighted text. Image extraction (`convertPDFToImages.ts`) stays as fallback for decks where text layer is absent or low-quality (pure slide images).

**2. Card synthesis**

Two modes ship together:

- **Structural (baseline).** Headings become card fronts; content underneath becomes card backs. Mirrors the toggle-as-card model already familiar to Notion users. No AI cost. Works offline. Always on.
- **AI-assisted (differentiator).** Extracted text chunks pass to Claude with a prompt tuned for spaced-repetition Q/A density. Med-student-specific instruction: prefer high-yield facts, preserve clinical vignette structure, flag image-only slides for image-back cards. AI mode is the reason Unlimited exists.

A third extraction hint — bold/highlight extraction — applies to both modes and surfaces as a checkbox on upload: "Extract bolded and highlighted text only." This mimics how students already annotate First Aid and Pathoma.

**3. Cost model**

AI mode is Unlimited-only at launch (existing `noLimits` gate). Free users get structural mode. This keeps margins predictable and gives Unlimited a clear differentiator beyond card count. Cost ceiling: hard cap at 500 Claude input tokens per page; skip pages that exceed it. Estimate total cost before the Claude call and abort if projected cost exceeds $0.50 per upload (configurable via `MAX_PDF_AI_COST_USD` env var). No per-card cost UI in v1 — that is a future spec.

**Med-student niceties**

- Page-range selection on upload (e.g. "pages 1–50") — mandatory for 200+ page books; keeps AI cost bounded.
- Bold/highlight extraction mode (see above).
- Image-on-back: when a page has both a text front and an embedded image, attach the image to the card back. The existing image extraction pipeline handles rendering; this spec wires the pairing.

## Files touched

- `src/lib/parser/convertPDFToImages.ts` — keep as image-fallback path; rename or extend to `extractPdfContent.ts` to unify text + image extraction
- `src/lib/parser/extractPdfText.ts` (new) — text + structure extraction layer; owns the `pdf-parse` / `pdfjs-dist` call
- `src/lib/parser/synthesizeCardsFromPdf.ts` (new) — structural mode and AI mode; calls Claude via the pattern in `src/lib/ankify/`
- `src/usecases/jobs/` — wire the new pipeline into the conversion job
- `src/lib/parser/__fixtures__/pdf/` (new) — reference corpus for regression tests (see Open questions)

## Success criteria

- Structural mode: a 30-page med lecture PDF produces >50 cards; a student self-review scores ≥4/5 for coverage and accuracy.
- AI mode: same 30-page PDF produces >100 Q/A pairs; self-review scores ≥4/5.
- Cost: AI mode processes a 30-page PDF for <$0.20 and a 200-page book (full, no page range) for <$0.50.
- Regression: decks generated from existing PDF uploads (image mode) are unaffected.
- Performance: structural mode completes in <10 s for a 30-page PDF; AI mode in <60 s.

## Out of scope

- SEO landing page for PDF (separate spec: `seo-input-type-landings`)
- Per-card cost UI — cost ceiling and env var are the v1 guardrails
- Built-in PDF viewer for review-before-export
- Scanned PDFs / OCR — treat as image-only; fallback to current image extraction

## Open questions

1. **Reference corpus.** Before coding, assemble 3–5 PDFs covering: med lecture slide deck, dense board prep chapter, language textbook page, technical paper, scanned-image slide. Run both `pdf-parse` and `pdfjs-dist` against each; pick the library with better heading and bold preservation. Corpus lives in `src/lib/parser/__fixtures__/pdf/` and drives regression tests.
2. **AI cost spike on large uploads.** The $0.50 ceiling is a reasonable estimate but needs validation on the corpus. If a 200-page book at full resolution exceeds the ceiling without page-range selection, we surface a prompt on upload: "This PDF is long — select a page range or switch to structural mode."
3. **Publisher DRM.** Some board prep PDFs are DRM-locked and extract as garbage. Detection heuristic: if extracted text is <10 characters per page on average, fall back to image mode and surface a warning. Confirm the heuristic is sufficient before build.
4. **Backwards compatibility.** `convertPDFToImages.ts` has been the live path. Any rename or internal restructure must preserve the existing call signature at the call site level; wrap, don't replace, until the new path is proven in production.
