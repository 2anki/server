# Spec: Dropbox Upload History

### Trio synthesis
- **PM:** Surface stored `dropbox_uploads` rows as a recent-uploads list; gate on ≥15% repeat-upload rate first; leading indicator is +8% conversions/week for returning Dropbox users.
- **Designer:** Section belongs on `/downloads` (not `/upload`), after My Decks; hide entirely when empty; sort by `id DESC`; no new sidebar entry.
- **Engineer:** S-effort read path; re-convert is M and should be PR 2; add `created_at` migration now; `WHERE owner = ?` from `res.locals` is the critical security requirement.
- **Agreement:** Feature is net positive; ownership enforcement is non-negotiable; `created_at` column needed before ship; cap at 10 rows with optional expand.
- **Conflict:** PM included "Convert again" as core; Engineer flags M-effort + stale-link risk. **Resolution:** split into PR 1 (read + delete) and PR 2 (re-convert). This spec covers both; phase 2 is marked explicitly.
- **Resulting plan:** Ship a "From Dropbox" section on Downloads (read-only + delete + `created_at` migration) as PR 1; re-convert in PR 2.

---

## Outcome

Logged-in users who have uploaded files from Dropbox can see those files in a "From Dropbox" section on the Downloads page and remove entries from the list. Phase 2 adds a "Convert again" button to re-run the conversion without re-browsing Dropbox. Aligns with the mission: fastest way to turn what you're studying into Anki flashcards — repeat conversions become one-click.

## Problem statement

A medical student uploads `pharmacology-week-3.pdf` from Dropbox on Monday, studies the deck, finds errors in the source PDF on Thursday, fixes them in Dropbox, and returns to 2anki.net to regenerate. Today she re-opens the Dropbox chooser, navigates three folders, and finds the file again. The file metadata has been in `dropbox_uploads` since her first visit — she just can't see it.

## Riskiest assumption + smallest test

**Assumption:** Users return and re-upload the same Dropbox file often enough to justify a UI surface.

**Test (run before building):** Query `dropbox_uploads` on prod: of users with ≥2 Dropbox uploads in the last 90 days, what % have ≥1 repeated `dropbox_id` or `name`? If under 15%, kill this spec and find a different lever. If 15%+, ship.

## Scope

**In (PR 1 — history + delete):**
- `GET /api/upload/dropbox/mine` — returns the logged-in user's last 10 rows, sorted `id DESC`, with optional `offset` query param for "Show older"
- `DELETE /api/upload/dropbox/mine/:id` — removes a single row by ID (ownership-checked)
- `created_at timestamptz default now()` migration on `dropbox_uploads` (additive; historical rows get NULL; new rows get a timestamp)
- "From Dropbox" section on `/downloads`, third section below My Decks
- Each row: file icon, filename, size, relative time (if `created_at` non-null), × remove button
- Skip rows where `isDir = true` (folders aren't convertible)
- Hide section entirely when the list is empty
- Anonymous users see nothing

**In (PR 2 — re-convert):**
- "Convert again" button per row
- Re-fetches Dropbox link, runs existing download + convert pipeline
- Stale/expired link → inline error: "This file isn't on Dropbox anymore. Pick it again from the upload page."

**Out:**
- Search, filter, pagination beyond "Show older"
- Google Drive, Notion, or direct-upload history (separate specs)
- Thumbnail/preview generation
- Sharing a history entry
- Anything for anonymous users

## User story + acceptance criteria

As a returning user who studies from the same Dropbox file across sessions, I want to see my recent Dropbox uploads so I don't have to re-browse Dropbox.

- [ ] Logged-in user with ≥1 `dropbox_uploads` row sees "From Dropbox" section on `/downloads`
- [ ] Section is hidden entirely when the user has no rows
- [ ] Each row shows: filename, formatted size (e.g. "2.4 MB"), relative time if `created_at` is set
- [ ] Rows where `isDir = true` are excluded
- [ ] List defaults to 10 newest; "Show older Dropbox files" expands to the next 20
- [ ] × button removes the row; `DELETE` endpoint enforces ownership (401 if no session, 404 if wrong owner)
- [ ] `GET` endpoint returns 401 without a valid session; never returns another user's rows
- [ ] `created_at` migration is included; historical rows with NULL sort last

## Leading indicator

Successful conversions per returning Dropbox user per week. Target: +8% within 4 weeks of launch. Secondary: median time-from-page-load to first `upload_started` event drops for returning Dropbox users.

## Design notes

**Location:** Third section on `/downloads`, after `FinishedJobs` and My Decks. No new sidebar entry.

**Section header copy:**
- Title: `From Dropbox`
- Subtitle: `Files you picked from Dropbox. Convert any of them again in one click.`

**Row layout:**
```
[Dropbox icon] biology-chapter-7.pdf                    [Convert again]  [×]
               2.4 MB · 3 days ago
```
- Left: 24 px Dropbox-blue file glyph (use `icon` field if present, else generic svg)
- Middle primary: filename, truncated with ellipsis, full name in `title`
- Middle secondary (muted): formatted size + relative time
- Right: "Convert again" button (secondary styling) — phase 2 only
- Right: × icon button (neutral, not red — removes a history entry, not a file)

**States:**
- Empty: hide section entirely
- List load error: `Couldn't load your Dropbox history right now. Refresh to try again.`
- Remove in-flight: row dims, × disabled
- Phase 2 — converting: button reads `Converting…`, disabled; job appears in the in-progress section above
- Phase 2 — stale link: `This file isn't on Dropbox anymore. Pick it again from the upload page.` + `Go to upload` link

**Reuse:** `sharedStyles.surface`, `sharedStyles.surfaceTitle`, `sharedStyles.surfaceLead`, `sharedStyles.btnSecondary`. Mirror `UploadObjectEntry.tsx` for row structure.

## Technical pre-flight

**Layers touched:** data_layer → usecases → controllers → routes → web

**Files in play (PR 1):**
- `src/data_layer/DropboxRepository.ts` — add `getByOwner(owner: number)` and `deleteByIdAndOwner(id, owner)`
- `src/usecases/uploads/GetDropboxUploadsUseCase.ts` — new
- `src/controllers/Upload/UploadController.ts` — add `getDropboxUploads` + `deleteDropboxUpload` handlers
- `src/routes/UploadRouter.ts` — add `GET /api/upload/dropbox/mine` and `DELETE /api/upload/dropbox/mine/:id` behind `RequireAuthentication`
- `migrations/<timestamp>_add_created_at_to_dropbox_uploads.js` — additive `created_at` column
- `web/src/pages/DownloadsPage/DownloadsPage.tsx` — render `<DropboxHistorySection />` after `<FinishedJobs />`
- `web/src/pages/DownloadsPage/components/DropboxHistorySection.tsx` — new
- `web/src/pages/DownloadsPage/components/DropboxHistoryEntry.tsx` — new (mirror `UploadObjectEntry.tsx`)
- `web/src/pages/DownloadsPage/hooks/useDropboxUploads.tsx` — new (mirror `useUploads.tsx`)
- `web/src/lib/backend/Backend.ts` — add `getDropboxUploads()` and `deleteDropboxUpload(id)`

**Security (critical):** `WHERE owner = ?` must use `res.locals.owner`, never a URL param. Mirror `UploadRepository.getUploadsByOwner` exactly — include the `owner == null` guard. The Dropbox `link` column should be omitted from the phase 1 response shape to avoid prematurely exposing it client-side.

**Migration:** Additive `created_at timestamptz default now()`. No existing rows break. Historical NULLs sort last. No Kanel regeneration needed for the new column until `pnpm kanel` is run.

**Effort:** S (PR 1, read + delete). M (PR 2, re-convert with Dropbox link re-fetch + pipeline re-entry).

**Cross-language:** None. Python bridge not involved.

**Open questions before work starts:**
1. Validation gate: run the 15% repeat-upload SQL check before cutting the branch.
2. Should `link` be in the phase 1 API response, or only in phase 2 when re-convert is in scope?
3. Is the history view gated (free vs. paying) or available to all authenticated users?
4. Should "Convert again" (phase 2) write a new row to `dropbox_uploads` or update the existing row's timestamp? Recommendation: new row — keeps the table append-only.
