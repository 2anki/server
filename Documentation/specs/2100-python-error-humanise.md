# Spec: Humanise Python conversion errors (#2100)

**Outcome**: First-time users who hit a Python crash see a clear next step instead of "Technical error Error: Python script exited with code 1...". Target: cut the 73% never-return rate among Python-crash users in half within 60 days.
**Goal alignment**: ~5% of new signups bounce at this exact error today; recovering even half is worth ~6K retained users per 100K signups against the 300K goal.
**Branch**: `fix/humanise-python-conversion-errors`
**PR title**: `fix(jobs): classify and humanise Python conversion errors (#2100)`

## Problem

- `buildPythonExitError` emits `Python script exited with code N: <raw stderr>`.
- `jobFailureReasonFromError` prefixes `Technical error ` and stores it in `jobs.job_reason_failure`.
- `web/src/pages/DownloadsPage/components/ListJobs/index.tsx:42` renders that string verbatim. No code change needed in `web/` — same field, cleaner content.

## Layered scope

`src/lib/anki/CardGenerator.ts` (caller, untouched) → `src/lib/anki/buildPythonExitError.ts` (classify) → `src/usecases/jobs/jobFailureReason.ts` (no prefix) → `jobs.job_reason_failure` (existing column) → existing web display surface.

## Classified crash modes

Classifier lives in `buildPythonExitError.ts`. Match against `stderr || stdout` (trimmed). First match wins. All messages use plain English; no "Python", "script", "code", "stderr".

| # | Detection (case-sensitive substring unless noted) | User-facing message (paste verbatim) |
|---|---|---|
| 1 | `UserWarning: Field contained the following invalid HTML tags` | `Something on this page — usually a pasted embed or copied-in web content — has formatting we can't read. Open the page in Notion, remove or simplify that block, and convert again.` |
| 2 | `Unsupported 'data_source'!` (also matches `Unsupported "data_source"`) | `This Notion database uses a view we don't support yet. Convert the parent page, or switch the database to a different view and try again.` |
| 3 | `MemoryError` OR `Killed` (whole-line match) OR exit code `137` | `This page is too large for us to convert in one go. Split it into smaller pages — or convert it section by section — and try again.` |
| 4 | empty output (current `(no output)` branch) OR no other classifier matched | `Something went wrong on our end converting this page. Email support@2anki.net with job ID <JOB_ID> and we'll take a look.` |

Notes:
- Modes 3 and the generic fallback are additions beyond the issue body; tests already cover the empty-stream and `code: null` paths, and `Killed`/`MemoryError` is a known shape on the prod box for very large Notion pages — worth claiming now while we're in the file.
- The `<JOB_ID>` placeholder must be filled in by `jobFailureReasonFromError`'s caller path. See "Code changes" below.

## Code changes

- **`src/lib/anki/buildPythonExitError.ts`**
  - Export a `PythonCrashKind` union: `'invalid-markup' | 'unsupported-data-source' | 'too-large' | 'unknown'`.
  - Export a new `PythonExitError extends Error` carrying `{ kind: PythonCrashKind, rawOutput: string, code: number | null }`.
  - `buildPythonExitError` returns `PythonExitError`. `message` is the human string (without job ID — generic fallback uses placeholder `__JOB_ID__` to be filled later, OR accept `jobId?: string` param; pick the param approach so the message is final at construction time).
  - Update `CardGenerator.ts` call site to pass `jobId` through. `jobId` is already in scope of `performConversion.ts` (`id` param) — pass it down to `CardGenerator.generate` (one new param).

- **`src/usecases/jobs/jobFailureReason.ts`**
  - Drop the `'Technical error '` prefix.
  - If `error instanceof PythonExitError`, return `error.message` directly.
  - Keep `EmptyDeckError` branch as-is.
  - Final fallback for unknown errors becomes the generic mode-4 message; accept an optional `jobId` arg.

- **`src/lib/storage/jobs/helpers/performConversion.ts`**
  - Pass `id` (job id) into `jobFailureReasonFromError(error, id)`.
  - On `PythonExitError`, log raw output server-side: `console.error('[conversion] python crash', { jobId: id, kind: error.kind, code: error.code, rawOutput: error.rawOutput })`. Use `console.error` to match the existing `[UploadService]` pattern (line 219 of `services/UploadService.ts`); the observability sink is HTTP-only and does not fit job-internal events.

- **`web/`**: no change. Same string field renders the cleaner copy.

## Tests

`src/lib/anki/buildPythonExitError.test.ts` — replace existing tests; the old "contains 'Python script exited with code'" assertions now contradict the contract. Add:
- `classifies invalid HTML tag warnings as invalid-markup and tells the user to simplify the offending block`
- `classifies Unsupported 'data_source'! as unsupported-data-source`
- `classifies MemoryError / Killed / exit code 137 as too-large`
- `falls back to unknown kind with job ID and support email when output is empty`
- `falls back to unknown kind when stderr does not match any classifier`
- `never includes the words "Python", "script", or "exited" in the user-facing message` (regex assertion across all branches)
- `retains the raw output on the error for server-side logging`

`src/usecases/jobs/jobFailureReason.test.ts` — replace the "Technical error Error: boom" test. Add:
- `returns the EmptyDeckError reason unchanged`
- `returns the PythonExitError message verbatim (no "Technical error" prefix)`
- `returns the generic fallback with job ID for an unknown error`
- `never produces a string starting with "Technical error"` (regex across all branches)

## Voice rules applied

- 1-2 sentences, plain English, recovery hint at the end.
- Generic fallback is the only message that mentions support; the others are self-serve.

## Open questions

- None blocking. Mode 3 (too-large) is a judgment call; if no `Killed` / `MemoryError` evidence exists in the wild, drop it and keep modes 1, 2, 4 — the spec still ships.

## Out of scope (explicit)

- Changes to `2anki/create_deck` (Python repo).
- Retry button / retry affordance on the downloads page.
- Moving Python in-process or rewriting the converter.
- Schema changes to `jobs` (no new columns; raw output stays in stdout/stderr logs).
- Backfilling old `job_reason_failure` rows.
