# Feature Prioritization — 2026 W20 Trio Analysis

**Date:** 2026-05-14
**Method:** Trio review (pm + designer + engineer) across all open and closed GitHub issues in `2anki/server` and `2anki/2anki.net`, cross-referenced against `docs/retros/2026-W19.md` (90-day failure-mode data, 106 failed jobs, 14-day cancellation feedback).

---

## Top 10 Features by User Love Signal (PM)

| # | Feature | Issues | Signal |
|---|---|---|---|
| 1 | Notion→Anki update sync — re-exports don't propagate changes | #1016 (11 comments, reopened May 2026), #310 | Core re-export loop silently broken; quiet churn |
| 2 | Reliable image rendering | #417 (12c), #928 (11c), #901 (8c) | Most-repeated bug class; medical students hardest hit |
| 3 | WYSIWYG / visual template editor | #991 (13 comments) | Most-commented open enhancement |
| 4 | Bullet points / hierarchical lists + tables → flashcards | #278, #1291 (7c), #1165 (5c) | Users already write notes this way |
| 5 | Onboarding for new users | #252 (11c), #92 (12c), #95 (9c), #2101 | 3 separate issues over years + funnel data |
| 6 | Synced blocks support | #899 (8c, reopened May 2026) | Power users want their existing patterns to work |
| 7 | Overlapping / nested cloze deletions | #85 (10c), #424, #1476 | Medical/language-learning workhorse; compound sentences fail |
| 8 | Cloze inside toggles + image-in-toggle | #81 (7c), #332 (6c) | Every active user feels this gap |
| 9 | Server stability — ENOSPC / stuck conversions / Python crashes | #1337 (13c), #1318 (8c), #2100 | ~5% new-user bounce on opaque Python crash |
| 10 | Public API | #925 (7c) | Low frequency, high leverage as acquisition channel |

**Dominant themes:** Pipeline reliability (~40% of high-signal threads), Notion feature coverage (synced blocks, tables, toggles+cloze), Customization (templates, WYSIWYG), Onboarding/growth, Bidirectional sync.

**Dead ends worth revisiting:** #1840 (disable image embedding — deck size pain resurfaces in support), #280 (Anki→Notion — bidirectional desire keeps reappearing), #57 (flatten decks — structural confusion re-filed repeatedly), #278 (bullets→cards — shipped but only partially, edge cases keep coming).

---

## Top UX Improvements by Retention Impact (Designer)

*Sourced from retro data: 51 users hit Python crash in 90 days → 73% (37 users) never logged back in. 65% of users hitting the paywall cap never returned.*

| # | Problem | Recommendation |
|---|---|---|
| 1 | **Opaque conversion failure** — raw traceback, no recovery path | `ConversionResult` component with named variants (see below). Cover top-5 failure modes: empty page, unsupported data_source, invalid token, timeout, region-rejected. |
| 2 | **Paywall cancel message has no upgrade CTA** (#2101) | Match PaywallBanner visual pattern on job-row cancel message. One primary CTA: "Upgrade to Unlimited — $X/mo" with `source=paywall-cancel` param. |
| 3 | **No "where's my deck in Anki?" handoff** | After download, inline hint: "Downloaded. Double-click to open in Anki. New? [60-second guide →]" — one line in the row, no modal. |
| 4 | **Mobile LP CTA forces desktop-only Notion OAuth** | Make LP primary CTA "Upload a file"; Notion OAuth is secondary. Phone users are dead on "Connect Notion". |
| 5 | **Cancellation has no re-engagement hook** | Add opt-in to cancellation modal: "Want a heads-up when we add features for ongoing study?" → email opt-in. Converts one-shot churn to future funnel. |

**Quick wins (small effort, outsized perceived quality):**
- Hash/truncate job IDs in user-facing copy — no raw UUIDs
- Apply `getDistance` for relative times everywhere (already used in PaywallBanner)
- Default download filename from page title slug (`anatomy-of-the-heart.apkg` not `notion-export-1715000000.apkg`)
- Replace Notion permissions wall-of-text with 3-step illustrated mini-guide on first failure
- Single CTA above the fold on all four `/x-to-anki` landing pages

**Flow breakers (users likely abandoning):**
1. Python crash row with no recovery (73% bounce — confirmed)
2. Paywall cancel with no upgrade link (65% no-return — confirmed)
3. Notion permissions errors that read like server logs
4. Ankify returning invalid Claude JSON (low volume, high dollar weight — paying-tier users)
5. Magic-link email never arriving (silent bounce class)

**One recommendation:** Build a single `ConversionResult` component that owns every post-conversion state — success, in-progress, paywalled, and the five named failure modes. Every variant: one-line headline in user language, one-line "here's what to do next," one primary action, one secondary action. No raw error strings, no ISO timestamps, no job UUIDs in body copy.

---

## Top 10 Buildable Features by Effort/Impact (Engineer)

| # | Feature | Issue | Effort | Note |
|---|---|---|---|---|
| 1 | Non-ASCII filename upload crash | #2184 | **S** | Live regression — `getSafeFilename` + `encodeURIComponent` at URL construction |
| 2 | `synced_block` support | #899 | **S–M** | Add `case 'synced_block'` in `blockToStaticMarkup.ts`; follow `column_list` pattern |
| 3 | Table block → flashcard rows | #1291 | **M** | "Render as HTML table" is S; "each row = one card" is architectural |
| 4 | `mention` inline rendering | #1011 | **S** | Extend `isText` guard in `renderTextChildren.tsx`; render `plain_text` |
| 5 | Code block newlines in card backs | #1451 | **S–M** | Two separate root causes: Notion API path (fine) vs. HTML upload path (regex strips `<pre>`) |
| 6 | Toggle rendering regression | #1059 | **M** | `removeToggleStructureTags` strips inner `<ul>/<li>` when `maxOne=true`; replace regex with cheerio traversal |
| 7 | Custom APKG name in Notion path | #763 | **S** | `CardOption.deckName` already wired in DeckParser; gap is in `AnkifyController` output filename |
| 8 | Open-in-Notion block-level link | #1124 | **S** | Thread `block.id` through `getLink()` when `addNotionLink=true` |
| 9 | `getSafeFilename` Unicode normalisation | #720 | **S** | `Buffer.from(name, 'latin1').toString('utf8')` + idempotent guard |
| 10 | `withRetry` reads `Retry-After` header | #1522 | **S** | 5-line change; Notion 429 exposes `retry-after` header; current max wait is 3.5s |

**Genuine quick wins (ship in a day or two):** #2184, #1011, #1522, #763, #1124.

**Red flags (seem simple, aren't):**
- Tables as cards: "switch-case" is render-only; per-row cards changes how `BlockHandler` decides what is a card source — architectural
- Code block fix needs both paths (Notion API and HTML upload) or regressions will persist
- Cloze numbering (#1476): closed Dec 2024 as "works as expected" but `handleClozeDeletions.ts` has an untested interaction between `handleRegularCloze` and explicit `c\d::` patterns — test-first before closing
- Toggle rendering (#1059): `removeToggleStructureTags` regex is the hot parse path; M–L work, needs comprehensive regression suite before touching

---

## Synthesis

### Where all three agree

1. **Reliability is the dominant pain.** Python crashes, non-ASCII filenames, rate-limit failures — this is what users hit most and what causes silent churn.
2. **Notion feature coverage gaps are real and buildable.** Synced blocks and tables appear in PM signal and are confirmed S–M effort by the engineer.
3. **The post-conversion experience is broken.** PM sees stale-card churn; designer sees 73% bounce on error states; engineer sees filename/encoding failures. Same surface, different angles.
4. **WYSIWYG editor is high-desire, high-effort — Q3 work.** PM ranks it #3 by engagement; engineer doesn't put it in the top 10 by buildability.

### Conflicts and resolutions

**Conflict: What to prioritize first.**
- PM: fix update sync (#1016) — core value proposition
- Designer: ConversionResult UX component — 73% bounce rate
- Engineer: non-ASCII filename crash (#2184) — live regression, S effort

**Resolution:** These aren't competing — they're different layers. Non-ASCII fix unblocks an entire language cohort in a day. ConversionResult component addresses the 73% bounce and 65% paywall no-return together, ~1 week of work. Update sync needs a spec first (product decision: replace cards? add new? flag stale?). **Sequence: non-ASCII this week → ConversionResult next → spec update sync for the sprint after.**

**Conflict: Tables as cards — switch-case or pipeline change.**
- PM sees high demand; engineer flags architectural complexity.
**Resolution:** Ship "render as HTML table in card back" first (S effort, immediate value). File separate spec for "each row = one card" as an architectural investment.

---

## Resulting Plan

### This week — Quick wins (S effort)
1. Fix non-ASCII filename crash (#2184) — `getSafeFilename` + encode guard
2. `mention` inline rendering (#1011) — `renderTextChildren.tsx` one-liner
3. `withRetry` reads `Retry-After` header (#1522) — 5 lines in `withRetry.ts`
4. Custom APKG name in Notion path (#763) — 1–3 lines in `AnkifyController`
5. Default download filename slug (designer quick win)

### Next sprint — ConversionResult UX (M, ~1 week)
- `ConversionResult` component with variants: `success`, `processing`, `paywalled`, `failed-empty`, `failed-permissions`, `failed-unsupported`, `failed-timeout`, `failed-other`
- Extend PaywallBanner visual pattern to job-row cancel message (upgrade CTA, fixes 65% no-return)
- Add "open in Anki" handoff line to success state
- Cover top-5 failure modes from retro (~95% of all failures)

### Sprint after — Notion feature coverage (S–M)
- Synced block support (#899) — `blockToStaticMarkup.ts`, follow `column_list` pattern
- Table as HTML table in card back (#1291) — S-effort renderer addition
- File separate spec for table-row-per-card (architectural)

### Spec and defer
- **Update sync (#1016):** Spec first — how should re-exports interact with existing Anki cards? Gate on "do >15% of users re-export the same source within 7 days?" instrument before building.
- **Toggle rendering overhaul (#1059):** M–L, test-first, dedicated sprint.
- **WYSIWYG editor (#991):** Q3, dedicated sprint.
- **Public API (#925):** Park until core reliability is locked.

---

## Key Files for Upcoming Work

| Work | Files |
|---|---|
| Non-ASCII filename | `src/lib/getSafeFilename.ts`, `src/services/UploadService.ts:267` |
| `mention` rendering | `web/src/components/renderTextChildren.tsx` |
| `withRetry` Retry-After | `src/lib/withRetry.ts` |
| ConversionResult component | `web/src/pages/DownloadsPage/components/UploadObjectEntry.tsx`, `PaywallBanner.tsx` |
| Synced blocks | `src/lib/parser/BlockHandler.ts`, `blockToStaticMarkup.ts` |
| Table rendering | `src/lib/parser/blockToStaticMarkup.ts`, `BlockHandler.ts` |
| Update sync spec | `src/services/NotionService/FEATURE.md`, `src/lib/parser/FEATURE.md`, `src/lib/ankify/FEATURE.md` |
