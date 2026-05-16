# Spec: Google Docs support + upload-source tab redesign

**Outcome**: Lift `upload_started_drive` -> `conversion_success` rate to within 5 points of the local-file path (currently the drop-off is silent because native Docs 400 mid-pipeline). Drive-tab activation rate stays flat or up after the tab redesign — not down.

**Goal alignment**: Drive is where students keep their notes. Today we tell those users "Drive works" and then bounce native Docs at the conversion edge. Closing that gap removes a class of "tried it once, never came back" churn that we cannot see in lagging metrics until it has already happened.

**Problem**: Specific instance — a user picks `BIOL 2402 - Lecture 3` from the Drive picker. It is a native Google Doc (`mimeType: application/vnd.google-apps.document`). The server calls `GET /drive/v3/files/<id>?alt=media`, Google returns 403 ("Only files with binary content can be downloaded"), the user sees "Error handling Google Drive files." They do not know that "Doc vs. PDF" is the distinction we are tripping on, and the picker did not warn them.

**Riskiest assumption**: That exporting a Google Doc to **HTML** produces a deck of comparable quality to the Notion-to-Anki path. If Docs HTML is dirty enough that the parser drops most toggle/heading structure, exporting to HTML wins us nothing over PDF and we should reverse the choice.

**Smallest test**: Before any UI work, run three representative Docs through the existing HTML conversion path locally: (a) a heading-heavy lecture outline, (b) a Doc with embedded images, (c) a Doc with tables. If two of three produce decks with the expected card count, ship HTML export. If not, fall back to PDF export and accept the parser's existing PDF behavior.

**Scope (in)**:
1. Server: when `mimeType.startsWith('application/vnd.google-apps.')`, swap `?alt=media` for `/export?mimeType=text/html` for Docs, `text/csv` for Sheets, `application/pdf` for Slides. Single switch in `createGoogleDriveDownloadLink.ts`, called from `handleGoogleDrive.ts`. Pass `originalname` with the exported extension so the existing parser routes correctly.
2. Tab redesign: keep the segmented control, drop visible labels for Dropbox and Google Drive to **icon + accessible name only**, keep "Your computer" as a full text tab on the left. Mobile: tab row stays one line; the local-file tab is always the widest and lands under the user's thumb. Add a 4th icon-only tab slot reserved for future sources; nothing renders until we light up OneDrive.
3. Picker scope: leave at `drive.file` — exporting works under the same per-file scope, no consent screen change.

**Scope (out, say it loud)**:
- A "paste a Google Docs URL" surface. Picker already exists; a second entry point doubles support load.
- A separate "Cloud notes" mega-surface. Premature; we have two cloud providers, not five.
- Sheets and Slides quality work. We will accept whatever the existing CSV/PDF parsers produce. If the CSV from a Sheet is empty we surface the existing empty-deck state, no new copy.
- A dropdown / side-rail / collapsing menu. Anything that hides "Your computer" behind a click violates the "1 second to local upload" constraint.
- Telling the user which Doc type was exported. They picked a file; they get a deck. Internal detail.
- Per-mime export overrides ("export this Doc as PDF instead"). No setting, no toggle.

**User story**: As a student whose lecture notes live as native Google Docs, I want to pick one from the Drive picker and get a deck back, without first knowing that Google distinguishes "a Doc" from "a PDF I dragged into Drive."

**Acceptance criteria**:
- [ ] Picking a native Google Doc yields a `.apkg` (or empty-deck state with existing copy if the Doc has no toggle structure).
- [ ] Picking a Google Sheet yields a deck from the CSV path or hits the same empty-deck state. No 400.
- [ ] Picking a Google Slides yields a deck from the PDF path or hits the empty-deck state. No 400.
- [ ] Picking a binary file already on Drive (PDF, .zip, .docx) behaves exactly as it does today. No regression.
- [ ] Tab row renders on a 360px-wide viewport without wrapping; "Your computer" is the widest tab; Dropbox and Drive are square icon tabs with `aria-label`.
- [ ] On hover or focus, the icon tabs show a tooltip with the provider name. Keyboard navigation announces "Dropbox tab" / "Google Drive tab" via `aria-label`.
- [ ] `fireAnalyticsEvent('upload_started')` is unchanged in name and timing. Add a single new event `gdoc_exported` fired server-side (or as a header the client logs) when the export path was taken — this is the metric for the riskiest-assumption test post-ship.
- [ ] No new env vars. No copy on `/pricing`. No changelog wording about "Docs" — write it as "Google Drive picks now work whether the file is a Doc, Sheet, Slides, or a regular upload."

**Architecture touchpoints**:
- `web/src/pages/UploadPage/components/UploadForm/UploadSourceTabs.tsx` — icon variant for non-local tabs; local stays text.
- `web/src/pages/UploadPage/components/UploadForm/UploadSourceTabs.module.css` — fixed-width icon tabs, keep `--radius-full` pill shape.
- `src/controllers/Upload/helpers/createGoogleDriveDownloadLink.ts` — branch on `mimeType`; return export URL + target extension.
- `src/controllers/Upload/helpers/handleGoogleDrive.ts` — use the new return shape; rewrite `originalname` to carry the exported extension so multer-side type detection downstream still works.
- No DB migration. No new use case. No Python touch.

**Open questions**:
- Does the Drive picker let users multi-select a mix of Docs + binary files? If yes, the loop in `handleGoogleDrive` already handles per-file mime — confirm during implementation that one failed export does not abort the batch.
- Should the icon-only tabs include a one-line caption underneath on first visit? Probably no, but designer to weigh in — the form already has a `formatList` row of pills, more chrome hurts.

**Out of scope (next iteration)**:
- OneDrive picker (the 4th tab slot is the only prep work done here).
- A "recent cloud files" surface on the Downloads page that lets users re-run a conversion without re-picking.
- Telling the user the source format (Doc, Sheet, Slides) on the success screen. Adds noise.

## Recommendation, one paragraph

Fix Docs inside the existing Google Drive tab — do not add a separate tab. The user's mental model is "the file is in my Drive"; we should not surface our implementation detail (export vs. download) as a navigational concept. Export Docs to HTML (gold-standard parser path), Sheets to CSV (existing parser path), Slides to PDF (existing parser path). Redesign the tab row to icon-only for cloud providers so a fourth source can land without crowding mobile, while keeping "Your computer" as a visibly wide, default-selected text tab so a brand-new user clicks it without thinking. Ship Docs export and the tab redesign **in one PR** — both are small, both touch the same form, and splitting them creates a stacked-PR problem the deploy pipeline does not want.

## What I'm NOT building

- No Docs URL paste box.
- No "Cloud notes" landing area.
- No dropdown, side-rail, or accordion of sources.
- No per-Doc export format toggle.
- No new env var, no new pricing surface, no new picker scope.
- No copy that uses the word "export" in the user-facing flow — they picked a file, they get a deck.
- No changelog entry that mentions HTML, PDF, or MIME types.
- No follow-up GitHub issues for the deferred work — captured in this spec's "Out of scope (next iteration)" and that is enough.
