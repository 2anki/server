# Spec: Structured error codes on upload failures

**Outcome.** Every `/api/upload/*` failure response carries a stable `code` field. The chat deep link can pre-seed a format-specific prompt (`/chat?from=upload&reason=too_large` instead of the coarse `reason=error`), and `ErrorPresenter` branches "what to do next" copy on the code. Unblocks `track('upload_error', { code })` for the analytics spec (PR #2320). Target leading indicator: lift recovery rate (retry-after-error) from current baseline by giving users a specific next step on the four most common failure classes.

**Goal alignment.** Users who hit an error today bounce instead of converting. Specific, actionable error copy is the cheapest lever we have on first-week retention, which is the single biggest gap to 300K users.

**Problem.** Today the frontend greps `err.message` strings to decide what to show — fragile, untyped, and impossible to instrument. `buildPythonExitError.ts` already classifies four kinds internally (`invalid-markup`, `unsupported-data-source`, `too-large`, `unknown`) but throws away the kind at the HTTP boundary. `ErrorHandler` ends with `res.status(400).send(err.message)` as `text/plain`. `ErrorPresenter` and `UploadForm` then run regex over the human string. One specific instance: a user uploads a 60 MB scanned PDF, hits `too-large`, and sees the same generic "Stuck? Ask Claude about this file" CTA as a user with malformed Notion HTML — both routed to `/chat?reason=error`.

**Decision.** **Option A — typed `code` field on the JSON 400.** Smallest server diff (one shared type, one middleware change, controllers throw typed errors), preserves `message` for back-compat, and matches the Sentry/Linear shape we already use elsewhere. RFC 7807 (B) adds five fields for one thing we need; status fan-out (C) collapses on `malformed_notion` and `corrupted_apkg`, both of which want 400.

**Error code enum.** Frozen TypeScript union shared between server and web at `src/types/UploadErrorBody.ts`:

```ts
export type UploadErrorCode =
  | 'unsupported_format'
  | 'too_large'
  | 'invalid_markup'
  | 'malformed_notion'
  | 'corrupted_apkg'
  | 'password_protected_pdf'
  | 'empty_export'
  | 'unknown';

export interface UploadErrorBody {
  code: UploadErrorCode;
  message: string;
}
```

Lowercase snake_case. `message` stays alongside `code` — back-compat for any caller reading the string.

**What we ship.**

- `src/types/UploadErrorBody.ts` — the union and body shape. Imported by web via the existing types path.
- `src/lib/anki/buildPythonExitError.ts` — map internal `PythonCrashKind` to `UploadErrorCode`.
- `src/routes/middleware/ErrorHandler.tsx` — switch from `text/plain` to `application/json`, map `PythonExitError` and the multer/limit/zip/PDF errors to `UploadErrorBody`, default to `unknown`.
- `src/controllers/Upload/UploadController.ts` — controllers that build their own 400 (e.g. unsupported format from `getUploadHandler`) emit `{ code, message }`.
- `web/src/components/errors/helpers/getErrorMessage.ts` — accept `UploadErrorBody`, branch on `code`, fall through to current string heuristics only when `code` is absent.
- `web/src/pages/UploadPage/components/UploadForm/UploadForm.tsx` — `chatCtaHref` accepts the code and threads it as `reason`. `extractErrorMessage` returns `{ code, message }`.
- Tests at every layer: `buildPythonExitError.test.ts`, `ErrorHandler.test.ts`, `UploadController.test.ts`, `getErrorMessage.test.ts`, `UploadForm.test.tsx`.

Layer path: `routes` → `controllers` → `usecases` → `services` → `data_layer`. This spec touches `routes` (middleware), `controllers` (typed throw), and `lib` (classifier). No DB changes.

**Per-code copy** (helper text per VOICE.md — full sentence, period):

- `unsupported_format` — "We can't read this file type. Use .zip, .html, .md, .pdf, .docx, .pptx, .csv, or .apkg."
- `too_large` — "This file is too large to convert in one go. Split it into smaller files and try again."
- `password_protected_pdf` — "This PDF is password-protected. Remove the password in your PDF reader, save a copy, and upload that."
- `invalid_markup` — "Something on this page has formatting we can't read. Open it in Notion, remove or simplify the broken block, and convert again."

`malformed_notion`, `corrupted_apkg`, `empty_export`, `unknown` keep today's generic copy in this PR.

**Backward compatibility.** `message` stays present. Any caller reading `err.message` keeps working. Old clients see a plain JSON body where they previously saw text — the existing `extractErrorMessage` helper already handles both, no breakage.

**Free vs paid.** No tier gating. Codes return identically.

**Out of scope (next iteration).** i18n on error messages; per-code retry strategies (auto-retry on transient classes); server-side format conversion (e.g. .pages → .docx); fixing the underlying parse failures; the analytics `track('upload_error', { code })` wiring lives in PR #2320; widening copy branching beyond the four top codes.

**Open questions.**

1. Should multer's own `LIMIT_FILE_SIZE` (multer error code) map to `too_large` even though that's currently swallowed by `isLimitError` and routed to the upload-limit (quota) flow? Recommend yes — these are distinct user problems and the current overload conflates "file too big" with "you ran out of free conversions".
2. Do we want `code` exposed on the success-path `X-Warning` header (for partial failures) or is that a separate spec? Recommend separate spec — warnings have a different shape today (free-text only).
