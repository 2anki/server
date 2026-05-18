# Spec: Password-protected PDF support

## Trio synthesis

- **PM:** Unblock 0.3–0.5% of conversions by removing the password-protected PDF wall; target PDF success rate from 92% → 95%.
- **Designer:** Optimistic upload with inline password field in the upload list (locked-row state); no upfront form field; allow retry with hint after 3 attempts.
- **Engineer:** Medium effort (3–4 half-days); thread password parameter through three layers; new POST endpoint for retry; validate password input, never log/persist it.
- **Agreement:** All three aligned on request-scoped password (no persistence), inline UI in upload list, structured error response distinguishing `needs_password` from other PDF failures, soft hint (not hard block) after wrong attempts.
- **Conflict:** None.
- **Plan:** Detect password requirement in PDF extraction, surface inline password field in upload list, retry conversion with supplied password, log success rate weekly.

---

## Outcome & goal alignment

Users with password-protected PDFs complete a conversion in-session instead of bouncing. This unblocks learners whose textbooks, course materials, and exam-prep documents ship encrypted by default.

**Metrics:**
- Primary: PDF conversion success rate (target 95% from 92% baseline). Password-protected PDFs are ~2–5% of total PDF uploads; unblocking even half represents a 0.3–0.5% gain in overall success.
- Secondary: Deck downloads after first PDF upload (leading indicator of user retention in the friction moment).

**Goal alignment:** ✓ Simplicity (no third-party tools needed; password entry is in-session) ✓ Speed (same upload, no re-upload cycle) ✓ Not complex (no new storage, no crypto logic, no schema changes).

---

## Problem statement

A learner with a textbook PDF from Pearson, McGraw-Hill, or a course platform exports a chapter. The file is encrypted — sometimes with a known credential (user-owned or shared), sometimes with an owner-only credential (print/copy restrictions). They upload it to 2anki and see:

> The PDF file is password-protected. Please remove the password protection and try again, or turn off PDF processing.

There is no way forward in the product. "Remove the password" means finding a third-party decryption tool, learning its UI, and abandoning 2anki. Many users will not return.

**Riskiest assumption:** That a meaningful share of these rejections are *user-owned* credentials the learner can supply — not DRM-locked files where they can't. If most failures are DRM (publisher-enforced copy protection), a password field changes nothing.

**Smallest test:** Before building the UI, instrument the existing error path in `src/lib/pdf/getPageCount.ts` to emit a `pdf_encrypted_rejected` event (count only, no file data) for one week. If we see >50 events/week, demand exists. If <10, defer. Cost: ~30 minutes to add logging in `src/services/observability/`.

---

## Scope

**In:**
- Detect password-protected PDFs during upload (per-file).
- Accept a credential from the user and retry extraction.
- Distinguish "wrong credential" from "DRM-locked" from "needs credential" in error responses.
- Credential is request-scoped, never persisted or logged.
- Works for single PDFs and PDFs inside ZIPs (if the ZIP contains exactly one encrypted PDF, prompt for credential; if multiple encrypted PDFs in one ZIP, skip with warning in v1).

**Out:**
- Per-user saved credentials (defer until usage justifies a DB migration).
- Batch credential entry (one credential for all files in a ZIP) — v2.
- Owner-credential bypass (print/copy restrictions only) — legally unclear, deferred.
- PDFs where the user doesn't know the credential.
- DRM-locked files remain blocked (image-only PDFs with copy protection).

---

## User story & acceptance criteria

**As a** learner with a password-protected textbook or course PDF,  
**I want to** enter the credential in the upload UI and convert the file in one session,  
**So that** I don't have to find a third-party tool and re-upload.

**Acceptance criteria:**
- [ ] When a PDF is password-protected, the server detects it and returns a structured response (not a generic error).
- [ ] The upload UI renders a locked-row state with an inline credential field and an unlock button (not a modal, not an upfront form field).
- [ ] The user submits the credential, the server retries PDF extraction with that credential.
- [ ] Correct credential: file converts normally, row shows in-progress state.
- [ ] Wrong credential: inline error under the field ("That didn't open the file. Check for typos and try again."), field remains focused, user can retry.
- [ ] After 3 wrong attempts: soft hint appears ("Still stuck? Some PDFs have owner-only protection that can't be entered here — open the file in Preview or Adobe Reader, save a copy, and upload that."), but user can still retry.
- [ ] Credential is not logged, not persisted, not returned in any response, and zeroed after the request.
- [ ] Credential input is validated: max 100 chars, trimmed of whitespace, no null bytes.
- [ ] Locked-row layout matches existing upload-list styling; uses `.card`, `.btnPrimary`, `.btnInline` utilities from `web/src/styles/shared.module.css`.
- [ ] DRM-locked files (avg chars/page <10 after successful decryption) still return `isDrmLocked: true` and display as before.

---

## Design notes

**User moment:** A student has a PDF with a known credential (either shared by the course or set themselves). They drag it into 2anki.

**Design recommendation:** Optimistic upload, reveal credential field only on demand.

- User uploads the PDF as they would today. No upfront credential field.
- Server detects encryption, returns a structured response flagging the file as `needs_credential`.
- The upload list row for that file flips to a **locked state** — neutral styling, not red. Inline expandable row reveals a credential input and an unlock action.
- User types the credential, hits unlock, the file resumes conversion. The rest of the batch is unaffected.
- Wrong credential: inline error under the field, field stays focused, file stays locked. Three failed attempts: a hint pointing to workarounds (don't block — just hint).

**Locked-row layout** (in the upload file list):

```
[lock icon]  Biochemistry-Chapter-4.pdf            [Locked]
             Credential required to read this PDF.

             [ credential input               ]  [Unlock]
             [ Skip this file ]
```

Row uses the existing `.card` utility with a muted border. Lock icon is neutral grey (not red — this is a known state, not a failure).

**Copy strings** (following VOICE.md):

| Context | String |
|---------|--------|
| Locked-state badge | `Locked` |
| Headline | `Credential required to read this PDF` |
| Input placeholder | `Enter credential` |
| Primary action | `Unlock` |
| Secondary action | `Skip this file` |
| While unlocking | `Unlocking` |
| Wrong credential (inline) | `That didn't open the file. Check for typos and try again.` |
| After 3 wrong attempts (helper text) | `Still stuck? Some PDFs have owner-only protection that can't be entered here — open the file in Preview or Adobe Reader, save a copy, and upload that.` |
| Unlock succeeds | Row flips back to in-progress state. No celebration toast. |
| Skip confirmation | Row collapses to `Skipped — Biochemistry-Chapter-4.pdf` with an `Undo` link. |

**Settings toggle:** No. This is reactive, not configurable. A toggle in settings ("allow encrypted PDFs") adds a decision the user shouldn't have to make. Encryption is a property of the file, not a user preference.

**Verdict:** Minor UI changes required.

- Structured server response distinguishing `needs_credential` from other PDF failures.
- New backend endpoint to retry conversion with a supplied credential.
- Frontend: locked-row state in the upload list component, inline credential field, unlock/skip actions.

**Files touched (frontend):**
- `web/src/components/upload/` — upload list component (identify exact file, likely `FileList.tsx` or similar).
- `web/src/types/` — API response type defining `needs_credential` error case.

---

## Technical pre-flight

**Layers touched:**
- Routes: New POST endpoint (e.g., `POST /upload/retry-with-credential`) accepting `{ fileId, credential }`.
- Controllers: `src/controllers/UploadController.ts` validates credential input (length, no control chars), calls conversion service.
- Use cases: Existing conversion use case, parameterized to accept optional credential.
- Services: `src/services/FileConversionService` (or equivalent) threads credential to PDF extraction.
- Data layer: No schema changes; credential is request-scoped.

**Files in play (backend):**
1. `src/lib/pdf/getPageCount.ts` — Currently rejects password-protected PDFs. Add `credential?: string` parameter; pass credential to `pdfinfo` as an argv element (not shell-interpolated — CWE-78). Detect and handle "Encrypted" / "password" in stderr; distinguish from other errors.
2. `src/lib/parser/extractPdfText.ts` — Add `credential?: string` parameter; pass to `pdfParse(buffer, { userPassword: credential })`. Refine `isDrmLocked` logic: after successful decryption, check avg chars/page. If still <10, set `isDrmLocked: true` (not `needs_credential`). Add `needsCredential: boolean` to return type to distinguish "needs decryption" from "DRM-locked".
3. `src/infrastracture/adapters/fileConversion/convertPdfTextToHtml.ts` — Thread credential parameter through to `extractPdfText`.
4. `src/infrastracture/adapters/fileConversion/PrepareDeck.ts` — Handle `needsCredential` case; return structured response to controller so UI can render locked-row state.
5. `src/routes/UploadRouter.ts` — Define POST endpoint for credential retry.
6. `src/controllers/UploadController.ts` — Validate credential input, call conversion service.
7. `src/lib/misc/hashToken.ts` — For audit logging (if needed), use pattern already in the codebase to mask credential references.

**Files in play (frontend):**
1. `web/src/components/upload/` — Add locked-row state rendering, inline credential input, unlock button, skip action.
2. `web/src/types/` — Define API response shape with `needsCredential` error case.

**Cross-language / CLI coordination:**
- `pdfinfo` (already used) needs credential support. Pass as argv element: `spawn(pdfinfoBin, [pdfPath, '--userpassword', credential])`. Verify with test PDF before shipping.
- `pdf-parse` npm library already supports `userPassword` option in the second parameter.

**Estimated effort: M (medium) — 3–4 half-days**

Why: Three coordinated layers (backend detection → retry endpoint → frontend UI) with credential threading on each. None are conceptually hard; credential validation is straightforward. The tricky parts are: (1) returning a structured response so the frontend can distinguish `needs_credential` from other errors, (2) retrying the specific file only (not the whole batch), (3) validating credential input safely. One day backend (credential threading + endpoint + validation), one day frontend (locked-row component + unlock action), 0.5 day integration testing.

**Security concerns:**
- ✓ Validate credential: max 100 chars, trim whitespace, no null bytes, no newlines. Reject before passing to `pdf-parse`.
- ✓ **Never log the credential.** Strip it from all logs, error messages, observability spans, Sentry events.
- ✓ **Never return the credential** in any API response.
- ✓ **Never persist.** Credential is request-scoped, dereferenced after the extraction call.
- ✓ Credential in request body (not URL query, not header), so it doesn't appear in proxy/CDN logs by default.
- ✓ Attempt limit: 5–6 wrong attempts per file per session before soft hint. No hard block. Soft limit prevents brute-force attempts.

**Testing strategy:**
- Create or obtain a small encrypted test PDF (using standard encryption tools). Keep it <10 KB; store in `src/test/fixtures/`.
- Unit test `extractPdfText(buffer, credential)`: calls `pdfParse` with credential, confirms text extracts correctly.
- Unit test `extractPdfText(buffer, "wrong-credential")`: confirms it returns an error or empty result and sets a flag (e.g., `needsCredential: true`).
- Unit test `getPageCount(pdfPath, credential)`: confirms it passes credential to `pdfinfo` and succeeds.
- Integration test: POST an encrypted PDF to `/upload`, verify response is `{ error: "needs_credential", fileId: "..." }` (not generic error). Then POST `/upload/retry-with-credential { fileId, credential: "correct" }` and verify file converts.
- Integration test: wrong credential returns `{ error: "needs_credential", reason: "wrong_credential" }` (distinct from missing credential).

**Migrations:** None. No database schema changes.

**Questions for implementation phase:**
1. Does `pdf-parse` accept owner credentials (print/copy restrictions) as well as user credentials? Affects the "still stuck" hint accuracy.
2. For ZIPs containing multiple encrypted PDFs: prompt once per file, or skip with warning? Recommend skip-with-warning in v1 (simpler), add per-file prompting in v2.
3. Should the credential field clear after a successful unlock, or persist in the input for the next file (in case the user has multiple PDFs with the same credential)? Recommend clear for security.

---

## Leading indicator & success metric

**Metric:** PDF conversion success rate (PDFs that return ≥1 card, not 0 cards).

- **Baseline:** 92% of uploaded PDFs successfully convert (per existing logs).
- **Target:** 95%+ (3 percentage point lift, representing ~0.4% of all conversions if PDFs are ~15% of uploads).
- **How to measure:** Log `conversion_result { fileId, format: 'pdf', success: bool, needsCredential?: bool, credentialProvided?: bool }` for every PDF processed. Filter for credential-related outcomes weekly for first two weeks post-ship.

**Leading indicator:** Deck downloads after first PDF upload (proxy for user completion and satisfaction).

---

## Definition of done

- [ ] Test PDF with known credential confirms `pdf-parse` decrypts and extracts text correctly.
- [ ] Wrong credential returns `{ error: "needs_credential", reason: "wrong_credential" }`, distinct from `{ error: "needs_credential", reason: "missing_credential" }`.
- [ ] Credential is never logged or persisted.
- [ ] Credential input validates: max 100 chars, no null bytes, trimmed.
- [ ] Upload list UI shows locked-row state when file returns `needs_credential`.
- [ ] User can enter credential and unlock in same session.
- [ ] Attempt counter: soft hint after 3 wrong attempts, allow retry (no hard block).
- [ ] DRM-locked files (image-only, after decryption) still detected and marked `isDrmLocked: true`.
- [ ] Conversion success rate is logged and monitored for first two weeks post-ship.
- [ ] Support template updated if it currently directs users to "remove the credential" — update to mention credential entry in-app.
- [ ] Changelog entry: `Password-protected PDFs — enter the credential during upload to convert the file without third-party tools`.

---

## Out of scope (v2 and beyond)

- Per-user saved credentials (requires DB migration, adds UI complexity).
- Batch credential entry for ZIPs containing multiple encrypted PDFs.
- Owner-credential bypass (legally unclear, separate decision needed).
- PDFs where the user doesn't know the credential.
