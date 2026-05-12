# Spec: Import APKG to Notion (#280)

**Outcome**: Authenticated users with a connected Notion workspace can upload a `.apkg` file and get a Notion page tree with toggle-list flashcards. Target: 500 successful imports in the first 90 days.
**Goal alignment**: The reverse flow (Anki -> Notion) converts Anki-only users into Notion+2anki users, expanding the funnel toward 300K. Issue #280 has been requested since 2023 and reopened after stale-bot auto-close -- persistent demand signal.

## Problem

Users who accumulated flashcards in Anki want them in Notion for editing, sharing, and feeding back into 2anki's Notion -> Anki pipeline. Today they must manually recreate every card as a toggle list. Some upload `.apkg` files to 2anki.net expecting reverse conversion and get nothing useful back.

## Proposed solution

One new endpoint. Upload `.apkg`, pick a destination Notion page, get a page tree where each deck becomes a child page and each note becomes a toggle block (front = summary, back = detail). Reuse the existing `ApkgPreviewService` parsing pipeline -- it already handles `collection.anki2`, `collection.anki21`, and zstd-compressed `collection.anki21b` archives.

### Data flow

```
Upload (.apkg)
  -> routes/ApkgRouter.ts (new POST /api/apkg/import)
    -> controllers/ApkgController.ts (new importToNotion method)
      -> usecases/apkg/ImportApkgToNotionUseCase.ts (new)
        -> services/ApkgPreviewService (existing: extractApkg + parseCollection)
        -> services/ApkgToNotionBlocksService.ts (new: pure transform, notes -> Notion block shapes)
        -> services/NotionService (existing: getNotionToken, then Notion SDK pages.create + blocks.children.append)
```

### Mapping rules

| Anki concept | Notion shape |
|---|---|
| Top-level deck | Child page under user-chosen parent page, titled with deck name |
| Sub-deck (e.g. `Bio::Cell`) | Nested child page (parent = `Bio` page, child = `Cell` page) |
| Note (Basic type) | Toggle heading 3: summary = first field (front), children = remaining fields as paragraphs (back) |
| Note (Cloze type) | Toggle heading 3: summary = raw text with cloze markers stripped, children = full text with `{{c1::...}}` notation preserved as bold |
| Media (images) | Upload to S3, embed as Notion `image` block (`type: "external"`, URL = S3 public URL) |
| Media (audio/video) | Upload to S3, render as a paragraph with a clickable link (Notion has no native audio/video block) |
| Tags | Appended as italic text at the bottom of the toggle body |

### Rate-limit handling

Notion free tier allows ~3 req/s. The use case must:
- Batch blocks: `blocks.children.append` accepts up to 100 children per call. Group notes into batches of 50 (leaving headroom).
- Throttle: 350ms delay between Notion API calls (< 3/s).
- Report progress: return a job ID immediately; client polls `/api/apkg/import/:jobId/status`.

### Media handling

The `.apkg` zip contains a `media` JSON file mapping numeric keys to original filenames (e.g. `{"0": "photo.jpg", "1": "clip.mp3"}`), with the actual files stored alongside under those numeric names.

**Flow:**
1. During extraction, read the `media` manifest and collect all referenced files.
2. Upload each file to S3 under `imports/{jobId}/{originalFilename}` using the existing S3 service (`StorageHandler`). Set `Content-Type` from the file extension. Objects are permanent (no expiry).
3. Build a lookup map: `originalFilename → S3 public URL`.
4. During the note-to-block transform, parse `<img src="filename">` references in note HTML fields. For each:
   - **Images** (jpg, png, gif, webp, svg): emit a Notion `image` block with `type: "external"` and `url` pointing to the S3 URL.
   - **Audio/video** (mp3, wav, ogg, mp4, webm): emit a `paragraph` block containing a link to the S3 URL.
   - **Other files**: skip silently (rare in practice).
5. Non-media HTML content (text, bold, italic) is still converted to Notion rich text as before.

**Constraints:**
- Media upload happens before block creation so all URLs are available during the transform.
- Use the existing S3 client — do not introduce a new upload mechanism.
- Total media per import is bounded by the existing multer upload size limit (the `.apkg` zip must fit within it).

## API design

### `POST /api/apkg/import`

Auth: `RequireAuthentication` (not Ankify-gated, not pay-gated). Requires connected Notion workspace.

Request: `multipart/form-data`
- `file`: the `.apkg` file (existing multer limits apply)
- `parent_page_id`: Notion page ID where deck pages will be created

Response: `202 Accepted`
```json
{ "job_id": "uuid", "status": "queued" }
```

### `GET /api/apkg/import/:jobId/status`

Auth: `RequireAuthentication`, owner must match.

Response:
```json
{
  "status": "processing" | "completed" | "failed",
  "progress": { "total_notes": 500, "imported": 312 },
  "notion_page_url": "https://notion.so/...",
  "error": null
}
```

## UI requirements (brief -- designer agent will detail)

- New "Import to Notion" action on the upload page, visible when user has a connected Notion workspace.
- Page picker: reuse the existing Notion page search (`searchTopLevelPages`) to let the user choose a destination.
- Progress indicator showing notes imported / total.
- Success state links to the created Notion page.

## Layered scope

| Layer | File | Change |
|---|---|---|
| Route | `routes/ApkgRouter.ts` | Two new endpoints |
| Controller | `controllers/ApkgController.ts` | `importToNotion`, `getImportStatus` methods |
| Use case | `usecases/apkg/ImportApkgToNotionUseCase.ts` | New: orchestrates parse + transform + Notion write + progress tracking |
| Service | `services/ApkgToNotionBlocksService.ts` | New: pure function, `NormalizedCollection -> BlockObjectRequest[]` tree; resolves media refs to S3 URLs |
| Service | `services/ApkgPreviewService/` | Existing, unchanged |
| Service | `services/StorageHandler` | Existing: upload extracted media files to S3 under `imports/{jobId}/` |
| Service | `services/NotionService/` | Existing `getNotionToken` + `NotionAPIWrapper.createBlock` |
| Data | Jobs table (existing) | Store import job status |

## What NOT to build

- **Scheduling data import**: Anki's review history (revlog table) is not useful in Notion's toggle format. Do not import intervals, ease factors, or due dates.
- **Two-way sync**: This is a one-shot import, not a live sync. No polling, no webhook, no conflict resolution.
- **AnkiConnect integration**: The flow is file-upload only. No desktop Anki API communication.
- **Custom note type rendering**: v1 uses field values directly, not Anki's card templates (qfmt/afmt). Template rendering is lossy outside Anki's webview and adds complexity without proportional value.
- **Deck options/settings**: Configuration (new cards/day, intervals) does not map to Notion. Skip.

## Open questions

1. **Job storage**: Reuse the existing `jobs` table or a lightweight in-memory map? The existing table has the right shape (`status`, `owner`, `created_at`). Recommendation: reuse it, add a `type = 'apkg_import'` discriminator if needed.
2. **Max deck size**: What is a reasonable cap? Notion's append-blocks endpoint is slow at scale. Recommendation: 5,000 notes per import; reject larger with a clear message. Revisit based on real usage.
3. **HTML handling**: Anki note fields contain HTML. Notion blocks accept rich text, not HTML. Recommendation: strip HTML to plain text for v1, preserving bold/italic where trivially mappable. `<img>` tags are resolved to Notion image blocks via S3 URLs. Full HTML fidelity (tables, code blocks, LaTeX) is a v2 concern.

## Out of scope (next iteration)

- Full HTML -> Notion rich text conversion (tables, code blocks, LaTeX).
- Batch import of multiple `.apkg` files.
- Progress websocket (polling is sufficient for v1).
