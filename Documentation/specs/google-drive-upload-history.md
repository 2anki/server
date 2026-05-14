# Spec: Google Drive Upload History

### Trio synthesis
- **PM:** Read-only history list with "Open in Drive" link; "Convert again" deferred (OAuth token not stored); gate on ≥15% click-through before building re-convert; `last_converted_at` migration needed.
- **Designer:** Fourth section on `/downloads`, below "From Dropbox", using a table layout (File / Size / Added / Actions) matching FinishedJobs; hide when empty; sanitize `url` to Drive origins only.
- **Engineer:** S+ effort; string PK needs regex validation; upsert semantics make `created_at` alone misleading — `last_converted_at` column is the right recency signal; `sizeBytes` arrives as string from Kanel.
- **Agreement:** "Convert again" out of phase 1; ownership enforcement non-negotiable; migration before ship; section hidden when empty.
- **Conflict:** PM suggested sorting by `lastEditedUtc DESC`; Engineer prefers `last_converted_at`. **Resolution:** `last_converted_at` — Drive's edit time is the file owner's clock, not the user's conversion history. Designer used table layout vs. Dropbox's simpler row layout. **Resolution:** table layout matches the existing FinishedJobs pattern on the same page.
- **Resulting plan:** Add "From Google Drive" table section to Downloads (read + delete + `last_converted_at` migration), `Open in Drive` external link per row, no re-convert in phase 1.

---

## Outcome

Logged-in users who have uploaded via Google Drive can see those files in a "From Google Drive" section on the Downloads page, with a link to open each file in Drive and an option to remove it from the list. Returning users who want to re-convert can navigate to Drive in one click instead of hunting through folders. Aligns with the mission: fastest path from studying to Anki flashcards — repeat conversions start with one click.

## Problem statement

A user uploads a 40-slide Google Slides deck on Monday, gets a `.apkg`, closes the tab. On Wednesday they want to regenerate it after editing the slides. Today they must re-open the Google Picker and navigate three folders deep. Meanwhile, the file's `id`, `name`, `iconUrl`, `mimeType`, and `url` have been in `google_drive_uploads` since the first upload — never shown.

## Riskiest assumption + smallest test

**Assumption:** Drive users want to revisit files they've already converted (vs. each upload being a one-shot assignment they never return to).

**Validation test:** Ship the read-only history section for one week. Instrument clicks on "Open in Drive". If fewer than 15% of users who view the section click any row, kill the feature before building re-convert. No OAuth, no new storage, no irreversible schema changes.

## Scope

**In (PR 1 — history + delete):**
- `last_converted_at timestamptz default now()` migration on `google_drive_uploads`, updated on every upsert
- `GET /api/upload/google_drive/mine` — authenticated user's rows, `ORDER BY last_converted_at DESC NULLS LAST`, limit 10, optional `offset` for "Show older"
- `DELETE /api/upload/google_drive/mine/:id` — removes a single row (ownership-checked; string PK validated with `/^[A-Za-z0-9_-]+$/`)
- "From Google Drive" table section on `/downloads` (fourth section, below "From Dropbox")
- Each row: file icon (with CDN fallback), filename, formatted size, relative time, "Open in Drive ↗" link, × remove
- Section hidden when empty; inline error state
- `url` field sanitized to `https://drive.google.com/` and `https://docs.google.com/` origins only before rendering

**In (PR 2 — re-convert):**
- "Convert again" button that triggers Google re-auth and re-runs the conversion pipeline using the stored `id`

**Out:**
- Search, filter, pagination beyond "Show older"
- Storing OAuth tokens or refresh tokens
- Dropbox, Notion, or direct-upload history (separate specs)
- Folder entries (`mimeType = 'application/vnd.google-apps.folder'`) — excluded from query
- Thumbnail/preview generation
- Feature flag / staged rollout (ship to all authenticated users at once)

## User story + acceptance criteria

As a logged-in user who has uploaded from Google Drive, I want to see those files listed on the Downloads page so I can open the source in Drive without hunting through folders.

- [ ] Authenticated user with ≥1 `google_drive_uploads` row sees "From Google Drive" section on `/downloads`
- [ ] Section is hidden entirely when the user has no rows
- [ ] Folder entries (`mimeType = 'application/vnd.google-apps.folder'`) are excluded
- [ ] Each row shows: file icon (onError → generic fallback), filename, formatted size (handles `sizeBytes` as string), relative time from `last_converted_at` (em-dash if null), "Open in Drive ↗" link, × remove
- [ ] "Open in Drive" `href` is sanitized — only `drive.google.com` and `docs.google.com` origins; disabled with title "Link unavailable" otherwise
- [ ] List defaults to 10 newest by `last_converted_at DESC NULLS LAST`; "Show older Google Drive files" expands by 20
- [ ] `DELETE` endpoint enforces ownership; string PK validated against `/^[A-Za-z0-9_-]+$/`; returns 401 without session, 404 if wrong owner
- [ ] `GET` endpoint returns 401 without session; never returns another user's rows
- [ ] `last_converted_at` migration included; upsert path in `saveFiles` updates the column on every UPDATE
- [ ] Jest test: `getByOwner` returns only correct owner's rows, excludes folders, sorts by `last_converted_at DESC NULLS LAST`
- [ ] Jest test: `deleteByIdAndOwner` with mismatched owner deletes 0 rows; test with crafted ID string confirms parameterized query
- [ ] Vitest test: hook covers loading, empty, and populated states; delete uses string key

## Leading indicator

Return-upload rate among users with `google_drive_uploads` rows. Target: +5pp within 4 weeks. Secondary: ≥15% of history-section viewers click "Open in Drive" in their first session (validation gate for phase 2).

## Design notes

**Location:** Fourth section on `/downloads`, directly below "From Dropbox".

**Table layout** (matching FinishedJobs, not the simpler Dropbox row layout):

| File | Size | Added | Actions |
|---|---|---|---|
| [icon] biology-chapter-7.pdf | 2.4 MB | 3 days ago | [Open in Drive ↗] [×] |

- **File icon:** 20 px `<img src={iconUrl}>` with `onError` swap to `/icons/file-generic.svg`. Only allow Google CDN origins; fallback on disallowed origin.
- **Filename:** truncated with ellipsis, full name in `title` attr.
- **Size:** humanized string (handles Kanel's `string` type for `sizeBytes`). `—` if null.
- **Added:** relative time from `last_converted_at`. `—` if null (historical rows).
- **Open in Drive:** neutral outline button (`previewButton`), `target="_blank" rel="noreferrer noopener"`. Not primary — this page is a memory and doorway, not a CTA surface.
- **× Remove:** `iconButtonDanger`, hover red only. Removes the history entry; does not touch the file in Drive.

**Section header copy:**
- Title: `From Google Drive`
- Subtitle: `Files you picked from Google Drive. Open them in Drive or remove them from this list.`

**States:**
- Empty: hide section entirely (no empty-state card)
- List load error: `We couldn't load your Google Drive history. Refresh the page to try again.`
- Null `created_at`/`last_converted_at` cell: `—`
- Null `sizeBytes` cell: `—`
- Remove in-flight: row dims, × disabled (`aria-label="Removing…"`)

**Reuse from `DownloadsPage.module.css`:** `styles.section`, `styles.sectionHeader`, `styles.sectionTitle`, `styles.sectionDescription`, `styles.card`, `styles.table`, `styles.fileName`, `styles.timeAgo`, `styles.actions`, `styles.iconButton`, `styles.iconButtonDanger`, `styles.previewButton`. No new CSS file needed.

## Technical pre-flight

**Layers touched:** data_layer → usecases → controllers → routes → web

**Files in play (PR 1):**
- `src/data_layer/GoogleDriveRepository.ts` — add `getByOwner(owner, limit, offset)` and `deleteByIdAndOwner(id: string, owner: number)`; update `saveFiles` upsert to set `last_converted_at = now()` on UPDATE
- `src/usecases/uploads/GetGoogleDriveUploadsUseCase.ts` — new
- `src/controllers/Upload/UploadController.ts` — add `getGoogleDriveUploads` + `deleteGoogleDriveUpload` handlers
- `src/routes/UploadRouter.ts` — add `GET /api/upload/google_drive/mine` and `DELETE /api/upload/google_drive/mine/:id` behind `RequireAuthentication`
- `migrations/<timestamp>_add_last_converted_at_to_google_drive_uploads.js` — additive `last_converted_at timestamptz default now()`, nullable; add index on `owner` if missing
- `web/src/pages/DownloadsPage/DownloadsPage.tsx` — render `<GoogleDriveHistorySection />` below Dropbox section
- `web/src/pages/DownloadsPage/components/GoogleDriveHistorySection.tsx` — new table component
- `web/src/pages/DownloadsPage/hooks/useGoogleDriveUploads.tsx` — new (mirrors `useDropboxUploads.tsx`)
- `web/src/lib/backend/Backend.ts` — add `getGoogleDriveUploads()` and `deleteGoogleDriveUpload(id: string)`
- `web/src/lib/formatBytes.ts` — new helper (handles string input from Kanel's bigint mapping)

**Key differences from Dropbox implementation:**
1. PK is `string` — `deleteByIdAndOwner` takes `string`, validate with `/^[A-Za-z0-9_-]+$/` before querying
2. No auto-increment — sort by `last_converted_at DESC NULLS LAST`, not `id DESC`
3. Upsert semantics — `saveFiles` UPDATE branch must `SET last_converted_at = now()`
4. `sizeBytes` is Kanel `string` (bigint) — formatting helper must accept string input
5. Folder exclusion — `WHERE mimeType != 'application/vnd.google-apps.folder'` in `getByOwner`
6. `url` field sanitization — only `drive.google.com` / `docs.google.com` origins before rendering

**Effort:** S+ (slightly larger than Dropbox's S due to upsert/sort complexity and string PK handling)

**Cross-language:** None.

**Migration:** Additive `last_converted_at timestamptz default now()` nullable. Historical rows get NULL (sort last). The upsert UPDATE path in `saveFiles` must be updated to touch `last_converted_at` or ordering will be misleading for repeat converters.

**Open questions before work starts:**
1. **`url` safety:** Is the stored `url` always a stable `https://drive.google.com/file/d/<id>/view` form, or can it contain OAuth tokens? Determines whether to include it in phase 1 response.
2. **`owner` index:** Does the migration need to add `CREATE INDEX ON google_drive_uploads(owner)`? Check existing migration for missing index.
3. **Paywall:** Is history gated (free vs. paying) or open to all authenticated users? (Same open question as Dropbox spec — needs resolution before either ships.)
4. **Validation gate:** Run `SELECT owner, id, COUNT(*) FROM google_drive_uploads GROUP BY owner, id HAVING COUNT(*) > 1` on prod to measure re-conversion rate before cutting the branch.
