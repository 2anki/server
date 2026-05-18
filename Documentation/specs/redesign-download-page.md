# Spec: Redesign the /download bulk page

### Trio synthesis
- **PM**: This page is a transactional receipt, not a landing — make `Download all (N)` the single hero with expiry stated inline; demote the per-file list to a compact, scannable secondary section.
- **Designer**: Kill the ✅/📦/📄/"Success!"; lead with the count as the H1 (`{N} decks ready`), source-file and total size as a muted subhead, full-width primary CTA, clean filename display via a server-side transform, simple list with CSS-sticky bar after the hero scrolls off.
- **Engineer**: Pure SSR via `ReactDOMServer.renderToStaticMarkup` (no JS, no hydration); `GET /download/:id/bulk` is a real `archiver`-backed zip endpoint; `jobs.title` and `created_at` already exist per-job; **the "24 hours" footer copy is a long-standing lie — `CLEANUP_AGE_SECONDS = 7200` is 2h**; zero test coverage on `DownloadPage` today.
- **Agreement**: Tone reset per VOICE.md; bulk-zip stays as hero (endpoint exists); per-file list is secondary; filename cleanup is a pure helper at render time; expiry line moves next to the primary CTA; no live countdown; footer marketing/© goes away.
- **Conflict (resolved by Alexander)**: Footer says 24h, reality is 2h. Option A "fix the copy to 2h" picked over raising `CLEANUP_AGE_SECONDS`. The redesign corrects the copy; cleanup timer stays at 2h.
- **Conflict (resolved)**: Per-row file size needs an `fs.stat` per entry. Accepted — typical N ≤ 20.
- **Conflict (resolved)**: Helper location — `src/lib/formatDeckName.ts` (engineer's call), not under `src/ui/`, so any future CSR consumer can share it.
- **Resulting plan**: One PR off `main` that rewrites the SSR components, adds a typed view model and a pure filename helper, corrects the expiry copy from 2h to 2h, and ships smoke tests plus a changelog entry.

---

**Outcome**: Lift successful first-deck-download within 60s of `/download/:id` page load. No live metric exists today; instrument with a single boolean event (`download_clicked` keyed by `id`) if not already covered and read it weekly.

**Goal alignment**: Every multi-deck upload ends here. A page that confuses users — or lies to them about expiry — burns conversions we already paid for. Cleaning this surface makes the last 30 seconds of the funnel match the rest of the product and stops users from losing decks they successfully converted.

**Problem**: A user redirected here after a 17-deck Notion-workspace conversion sees a marketing-style "✅ Your Anki Decks Are Ready!", a paragraph of tutorial copy, then 17 hash-prefixed filenames like `-How-to-make-all-cloze-number-1-5827131637243234.apkg`. The 24-hour deletion promise is buried in grey text below social links — and is wrong: files actually expire after 2 hours. Users have lost decks because of this. The page is celebrating while the product is quietly failing them.

**Riskiest assumption**: That users would prefer a count-led, restrained page (`17 decks ready`) over the current celebration. Most product reviews assume cheerfulness drives conversions; we're betting the opposite for an audience that's anxious to grab files and leave.

**Smallest test**: Ship the redesign behind no flag — the page is server-rendered, has zero analytics today, and reverts cleanly via git. The 7-day signal is "did the support-email count drop for 'where are my decks' / 'why is it asking me which file' patterns" plus the new `download_clicked` event rate.

**Scope**:

In:
- Copy rewrite per VOICE.md (banned: ✅, ❌, 📦, 📄, "Success!", exclamation marks, "click each one" tutorial copy).
- Count-led H1, source-file + total-size subhead, full-width `Download all ({N})` CTA, expiry line beside CTA.
- Pure filename helper at `src/lib/formatDeckName.ts` + colocated test.
- Typed view model in `DownloadController.getDownloadPage`; never pass raw DB rows to the view.
- CSS-only sticky secondary `Download all` bar when N ≥ 8 (top on desktop, bottom on mobile).
- Smoke tests on `DownloadPage` (currently uncovered) and an extension of `DownloadController.test.ts`.
- One-line changelog entry.
- **Correct the expiry copy from "24 hours" to "2 hours"** to match `CLEANUP_AGE_SECONDS = 7200`.

Out:
- Card preview, rename UX, auth-gated download history, per-deck delete, share links, "Open in AnkiWeb".
- Any change to `GET /download/:id/bulk` or `GET /download/:id/file/:filename`.
- Any change to `CLEANUP_AGE_SECONDS`.
- Live countdown (would require injecting JS into an otherwise-JS-free page).
- Per-deck card count (`jobs.card_count` is aggregate, not per-file).
- The signed-in `/downloads` history page (different surface).

**User story**: As a learner who just uploaded a Notion export with 17 pages, I want to grab all my decks with one click and know how long I have, so that I can get into Anki and start studying without losing any files.

**Acceptance criteria**:
- [ ] Page H1 reads `{N} decks ready` (sentence case, no emoji, no exclamation). N=1 renders `1 deck ready`.
- [ ] Subhead reads `From {sourceTitle} · {totalSize} total` when `sourceTitle` resolves; omitted entirely when it doesn't (no padding).
- [ ] Primary CTA reads `Download all ({N})`, links to `/download/:id/bulk`, full-width on viewports < 600px.
- [ ] Expiry line reads exactly `Available for 2 hours, then removed.` and sits adjacent to the primary CTA, not in the footer.
- [ ] Each row renders cleaned `displayName` (per helper rules below) + muted `· {sizeKB} KB`, with `<a href="..." title="{originalName}" download="{originalName}">`. The user's disk gets the original bytes.
- [ ] `src/lib/formatDeckName.ts` is a pure function. Cases pass: `-How-to-make-all-cloze-number-1-5827131637243234.apkg` → `How to make all cloze number 1`; `📄😺-HTML-test-5191454476635145.apkg` → `HTML test`; `.apkg` → `Untitled deck`; a name with no trailing-ID suffix survives unchanged.
- [ ] `DownloadController.getDownloadPage` builds an explicit typed view model `{ id, sourceTitle, files: [{ originalName, displayName, sizeBytes }], totalSizeBytes }`. The raw `jobs` row never leaves the controller.
- [ ] `jobs` lookup uses bound parameters via the existing repository — no raw SQL string concatenation.
- [ ] When N ≥ 8, a `position: sticky` secondary bar shows `{N} decks · Download all ({N})` — pure CSS, no script tag on the page.
- [ ] Footer contains only `2anki.net · Documentation · GitHub`. No tagline, no ©.
- [ ] Empty state: H1 `No decks found in your upload`; body `Check that your file follows the formatting guidelines and try again.`
- [ ] None of `✅`, `❌`, `📦`, `📄`, `Success!`, the word "Awesome", or any `!` appears in the rendered HTML. Smoke tests assert this.
- [ ] Changelog entry added to `web/src/pages/WhatsNewPage/changelog.ts`.
- [ ] Mobile (375px) and desktop (≥720px) both render without horizontal scroll; rows wrap rather than truncate names off-screen.
- [ ] `pnpm test src/lib/formatDeckName.test.ts`, `pnpm test src/ui/pages/DownloadPage.test.tsx`, and `pnpm test src/controllers/DownloadController.test.ts` all pass. `/check` is green.

**Open questions**:
- Should the sticky-bar threshold be N ≥ 8 or N ≥ 10? Designer picked 8; flexible. Either is fine — pick one number and stop tuning.
- The `download_clicked` event — do we already have it? If not, is adding one `instrumentedAxios` POST acceptable in this PR or split out? *(Engineer to confirm in the implementation PR.)*

**Out of scope (next iteration)**:
- Per-deck card counts (would require parsing each `.apkg` at request time — `ApkgPreviewService` territory).
- A live "expires in HH:MM" countdown (requires JS on this SSR-only page).
- A `download_all_clicked` vs `download_clicked` event split.
- Raising `CLEANUP_AGE_SECONDS` to 24h — separate spec; would mean 12× the disk-residence time on the prod box.

---

## Design notes

**User moment.** A learner just clicked "Convert" on a multi-page Notion export or a multi-deck zip and was redirected here. They are not browsing. They want to (a) get the files onto their machine, (b) know how long they have. Everything else is noise.

**Hierarchy.** Top to bottom: count → muted source/size → primary CTA + expiry line side-by-side → per-file list → minimal footer.

**Copy strings** (final):

| Slot | Final string |
|---|---|
| `<title>` | `{N} decks ready — 2anki` (fallback `Your decks — 2anki`) |
| H1 | `{N} decks ready` |
| Subhead | `From {sourceTitle} · {totalSize} total` (omit entirely if `sourceTitle` empty) |
| Primary CTA | `Download all ({N})` |
| Expiry line | `Available for 2 hours, then removed.` |
| Per-row label | `{cleanedName}` + muted `· {sizeKB} KB` |
| Per-row CTA | `Download` |
| Sticky bar | `{N} decks · Download all ({N})` |
| Empty H1 | `No decks found in your upload` |
| Empty body | `Check that your file follows the formatting guidelines and try again.` |
| Footer | `2anki.net · Documentation · GitHub` |

**Filename display rule** (applies in `src/lib/formatDeckName.ts`, server-side, once):

1. Strip `.apkg`.
2. Strip trailing `-\d{10,}` ID suffix.
3. Strip leading/trailing `-`.
4. Replace internal `-` with single space.
5. Collapse whitespace; trim.
6. Strip leading non-alphanumeric Unicode (drops `😺` and similar).
7. If result is empty, fall back to `Untitled deck`.

Original filename is preserved on `title` and `download` attributes so the file on disk keeps the real bytes.

**Layout.** Simple list, not a table, not cards. Each row is a single full-row `<a>` for tap target on mobile. Rows separated by background-color shift, not borders. White card on `#f8fafc`, container ~720px on desktop, full-width on mobile.

**Sticky bar.** Pure CSS `position: sticky` — top on desktop, bottom on mobile. Only shown when N ≥ 8 (server-side conditional render; no JS).

**ASCII mockup (desktop):**
```
┌──────────────────────────────────────────────────────────────────────┐
│  17 decks ready                                                      │
│  From Biology-Notes.zip · 4.2 MB total                               │
│                                                                      │
│  [ Download all (17) ]   Available for 2 hours, then removed.        │
│  ────────────────────────────────────────────────────────────────    │
│   How to make all cloze number 1     248 KB     Download  →          │
│   HTML test                          186 KB     Download  →          │
│   …                                                                  │
│  ────────────────────────────────────────────────────────────────    │
│   2anki.net  ·  Documentation  ·  GitHub                             │
└──────────────────────────────────────────────────────────────────────┘
```

**Verdict**: changes to PM scope are zero — the spec already captures the design.

---

## Technical pre-flight

**Layers touched**: `controllers` (view-model construction), `ui` (SSR components and styles), `lib` (new pure helper), `web` (changelog only). No `routes`, no `usecases`, no `services`, no `data_layer`, no migration.

**Files in play**:
- `src/controllers/DownloadController.ts` — extend `getDownloadPage` to fetch `jobs.title` via existing repository, `fs.stat` each `.apkg`, build typed view model.
- `src/ui/pages/DownloadPage.tsx` — assemble new hero block and view-model wiring.
- `src/ui/components/download/DownloadTitle.tsx` — count-driven H1.
- `src/ui/components/download/DownloadDescription.tsx` — source/size subhead or omit.
- `src/ui/components/download/DownloadList.tsx` — single-anchor rows, cleaned name + size.
- `src/ui/components/download/DownloadFooter.tsx` — three links only.
- `src/ui/components/download/styles.tsx` — neutralize blue H1, background-shift dividers, sticky-bar rule.
- `src/lib/formatDeckName.ts` (**new**) + `src/lib/formatDeckName.test.ts` (**new**).
- `src/ui/pages/DownloadPage.test.tsx` (**new**) — smoke tests for N=0, N=1, N=17.
- `src/controllers/DownloadController.test.ts` — extend for new view-model shape and `jobs`-row fallback.
- `web/src/pages/WhatsNewPage/changelog.ts` — one-line entry.

**Cross-language coordination**: None. Server TypeScript only, plus one line in the web workspace's changelog file.

**Estimated effort**: **M** (~half a day). The helper + tests are S; the controller view-model + repo call is S; the rewrite of five small SSR components and styles is M because every string is being touched and the mockup is opinionated; the sticky-bar CSS adds a small surface to get right across breakpoints; the new `DownloadPage` smoke test plumbs the first React testing harness for SSR components, which is fresh ground.

**Security**:
- `jobs.title` lookup must use bound parameters (`.claude/rules/security.md` row 1). No `knex.raw` with interpolation.
- `id == null` checks where applicable (avoid `!id` rejecting `0`).
- Never log the workspace `id` alongside any user identifier in the same record — this is a public download URL.
- The new helper must not interpret any path component — it operates on the cleaned filename string only. Path-traversal protection lives in the existing `getFile` route and is **out of scope**.
- `<a href title download>` values are user-influenced (filenames from the workspace dir). React's default escaping in `renderToStaticMarkup` handles HTML entities; verify by asserting that an `<svg onload="alert(1)">.apkg` filename renders escaped in the smoke test.

**Testing**:
- TDD on `formatDeckName`: write the 4 case-table tests first; watch them fail; implement.
- `DownloadPage.test.tsx` should use the standard ts-jest config — no special setup. Assert via `renderToStaticMarkup` output string, not DOM, matching the production rendering path.
- `DownloadController.test.ts` already mocks `fs`; extend the mock with `fs.stat` returning sized stat objects.

**Migration / data layer**: None. No schema change, no Kanel regeneration.

**Sonar**: Run `sonar-scanner` locally before flipping the draft PR ready — the rewrite touches enough functions that cognitive complexity, nesting, and a11y smells could surface.
