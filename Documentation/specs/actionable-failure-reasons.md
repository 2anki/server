# Actionable failure reasons on `/downloads`

## One-line goal

Failed Notion conversions on `/downloads` tell the user *what went wrong* and *what to try next*, instead of a status pill that hides the existing reason text in the API response.

## Context

When a job fails on the worker, the controller already writes a user-facing message into `jobs.job_reason_failure` (see `src/usecases/jobs/jobFailureReason.ts` and `src/lib/anki/buildPythonExitError.ts`). The API includes it in `JobController.ts:24`. The web schema at `web/src/schemas/public/Jobs.ts` carries it. The DownloadsPage gets the field — and renders only a `<StatusTag>` (`DownloadsPage.tsx:117`). The reason text never reaches the screen.

The 2026-05-18 `/`-in-Notion-title crash (PR #2438) was the canonical case: 4 worker crashes in 110 minutes, one real user, and the only signal anyone saw was 4 identical emails to Al's inbox. The fix shipped, but the *next* unknown crash class will reproduce the same silent-retry pattern unless we surface the reason.

## In scope

1. **New classifier kind `bad-title`** in `src/lib/anki/buildPythonExitError.ts`.
   - Signature: `output.includes('FileNotFoundError') && output.includes("-> '")` — narrow to rename/replace failures, not all path reads.
   - User message: `Your page title has a "/" in it, which we can't save as a filename. Rename the page in Notion (try a dash or "and") and convert again.`
   - Extend `PythonCrashKind` union; map to an `UploadErrorCode` (reuse `unknown` or add `bad_title` — pick whichever keeps `toUploadErrorCode` total).
   - New Jest case in `buildPythonExitError.test.ts`: stderr containing the `FileNotFoundError ... -> '...'` shape → `kind === 'bad-title'`, message names the offending character.

2. **Empty-deck copy tightening** in `jobFailureReason.ts`.
   - Strip the parenthetical tutorial (`(the little triangles you click to expand)`) and the raw `/documentation/...` URL out of `EMPTY_DECK_FAILURE_REASON`.
   - New shape: `No cards in this deck yet. 2anki turns Notion toggle blocks into flashcards — the toggle title becomes the question, what's inside is the answer. Wrap your key terms in toggles in Notion, then convert again.`
   - The `Learn more →` link is rendered by the frontend (next item), not stored in the message string.

3. **Inline expandable panel under failed rows** on `DownloadsPage.tsx`.
   - For rows where `isFailedJob(j.status)`, the `<StatusTag>` becomes a toggle button with a `▾` / `▴` chevron.
   - Clicking expands a same-`<tr>` panel (full-width, `colSpan` of the row), `padding: 1rem 1.25rem`, `background: var(--color-bg-secondary)`, `font-size: var(--text-sm)`.
   - Panel renders `j.job_reason_failure` in `--color-text-primary`, plus a `Learn more →` tertiary link to `/documentation/help/common-problems` for the `EmptyDeckError` case only (other kinds get no link in v1).
   - Only one panel open at a time — opening another collapses the first.
   - **Auto-expand on mount** for the most recent failed row whose `last_edited_time` is within the last 10 minutes. If `last_edited_time` is missing/NaN, default closed.
   - Failed rows get a 2px left border in `var(--color-warning)` (recoverable, not destructive — confirm token exists at `web/src/styles/shared.module.css:571`; if not, fall back to the existing `surfaceWarning` value).

4. **Tests**
   - Jest: classifier branch above.
   - Vitest: the expand/collapse interaction, that the panel renders `job_reason_failure`, that auto-expand fires only for failures < 10 min old, that closed-by-default holds for older failures.

5. **Changelog entry** in `web/src/pages/WhatsNewPage/changelog.ts`:
   - `{ type: 'fix', title: 'Failed conversions tell you what went wrong and what to try next on the Downloads page', date: '<merge date>' }`

## Out of scope (v2+)

| Item | Why deferred |
| --- | --- |
| `user_visible_errors` table for non-job sinks | We don't have user signal on OAuth/Stripe-class silent failures yet. Add the table when a non-job failure class hits a real user repeatedly. |
| Banner on `/downloads` reading the last 24h failure | Depends on the table above. |
| `/api/ops/errors` admin viewer | Build only after the table exists and `psql` becomes painful. |
| `send_error_email` classifier + rate-limiter | Observability cleanup. Independent of the user-facing surface and should follow a measured inbox-volume problem, not precede it. |
| `notion.parser.zero_cards` counter | Format-drift signal. Better as part of the Notion-format-canary work, not bundled here. |
| Wider classifier audit (replay last 30 days of `unknown` stderr to find other repeat signatures) | Worth doing — but a separate `chore:` follow-up so the v1 PR stays small. Open a GitHub issue when v1 merges. |

## Success metric

Failed-job rows on `/downloads` that show an actionable, in-voice reason string: from ~0% today (the field renders nowhere) to **≥85% within 7 days** of merge. Measured by sampling 50 most recent `status='failed'` rows in prod and checking (a) `job_reason_failure` is populated, (b) the rendered text names a fixable user input *or* an explicit "email support" path. Al's support-inbox volume for "my deck never appeared" should drop within two weeks — leading indicator, don't gate the ship on it.

## Risks

- **Classifier false positives.** Some unrelated Python crash could match `FileNotFoundError` + `-> '` and surface a misleading "your title has a slash" message. Mitigation: spot-check the last 30 days of `unknown` stderr through the new classifier before the PR flips ready. If >2 false matches, narrow the signature further (e.g., require `os.replace` in the traceback).
- **Auto-expand state.** If `last_edited_time` is mis-typed (Kanel says `Date | null` but the JSON wire format is a string), the 10-minute check silently fails. Memory rule covers it (`feedback_kanel_dates_are_strings.md`) — assert by passing the string through `new Date(...)` before comparison.
- **`--color-warning` token.** Confirmed at design-time in `shared.module.css:571` per designer; recheck during implementation. Fallback: pick the closest amber from `:root`.

## v2 appendix — `user_visible_errors` table sketch

For the non-job sinks (Notion OAuth catch at `NotionController.ts:97-101`, Stripe webhook 5xx in `WebhookRouter.ts`, EmptyDeckError on upload paths that never created a job):

```js
// migrations/<date>_user_visible_errors.js
exports.up = async (knex) => {
  await knex.schema.createTable('user_visible_errors', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('user_id').notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    t.timestamp('occurred_at', { useTz: true })
      .notNullable().defaultTo(knex.fn.now());
    t.string('surface', 32).notNullable();   // 'notion-oauth' | 'stripe-webhook' | …
    t.string('kind', 64).notNullable();
    t.text('message_for_user').notNullable();
    t.text('internal_detail').nullable();
  });
  await knex.schema.raw(
    'CREATE INDEX ON user_visible_errors (user_id, occurred_at DESC)'
  );
};
```

Flag at implementation time: confirm `user_id` typing matches `users.id` after `pnpm kanel` runs — engineer flagged this as a likely drift point.

## Files this PR will touch

- `src/lib/anki/buildPythonExitError.ts` (+ `.test.ts`)
- `src/usecases/jobs/jobFailureReason.ts`
- `web/src/pages/DownloadsPage/DownloadsPage.tsx`
- `web/src/pages/DownloadsPage/components/ListJobs/StatusTag.tsx`
- `web/src/pages/DownloadsPage/components/ListJobs/StatusTag.module.css` (or sibling)
- `web/src/pages/WhatsNewPage/changelog.ts`

## Eventual commit type

`feat:` — new user-visible UI (the expandable panel + visual cue) plus a new classifier kind. The spec branch is `feat/spec-actionable-failure-reasons` so it can graduate cleanly to `feat:` per the spec-lifecycle rule.
