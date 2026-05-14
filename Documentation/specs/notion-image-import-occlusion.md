# Spec: Import images from Notion into Image Occlusion

### Trio synthesis
- **PM:** Page-scoped import only; server re-uploads Notion images to app S3; target +15% draft-creation rate among Notion-connected users in 4 weeks.
- **Designer:** Right-side drawer over canvas, two views (page picker → image gallery), multi-select, reuses existing `NotionPagePicker` pattern and `ConnectNotion` empty state.
- **Engineer:** M effort; single `POST /api/image-occlusion/draft/notion-image` with `{ blockIds[] }`; SSRF guard via `instrumentedAxios`; no new DB schema or env vars; spike first to verify server-side Notion file URL fetch works.
- **Agreement:** Server-side download is mandatory (SSRF); no DB changes; gated on Notion connection; reuse existing `GET /api/notion/blocks/:id` for gallery; same `{ s3Key, presignedUrl }` shape as local upload.
- **Conflict:** PM proposed a new "list images" endpoint; engineer recommended using the existing blocks endpoint client-side. **Resolved in engineer's favor** — fewer endpoints, all existing infrastructure reused.
- **Resulting plan:** Stacked add button in ImageQueue → right-side drawer → page search via `searchTopLevelPages` → image gallery via existing `GET /api/notion/blocks/:id` (client filters `type === 'image'`) → multi-select → `POST /api/image-occlusion/draft/notion-image` → images land in queue identically to local uploads.

---

## Outcome

Notion-connected users can pull images from any Notion page into Image Occlusion in under 30 seconds, without leaving the page or re-downloading from Notion.

**Goal alignment:** Removes "download from Notion → re-upload" friction for users we already acquired. Compounding effect: every Notion-connected user gets a second reason to engage with Image Occlusion.

**Leading indicator moved:** Draft-creation rate among Notion-connected users (`io_draft_created` events with `source=notion`). Target: **+15% in 4 weeks** vs. baseline.

---

## Problem

A Notion-connected user has a biology diagram in a Notion study page. To use it in image occlusion today she must: open Notion → right-click → save to disk → re-upload to 2anki. She abandons.

~40% of weekly active IO uploaders already have a valid `notion_tokens` row — they trust us with their workspace. The re-download step is pure friction we put there.

---

## Riskiest assumption

Users want to browse images across their whole workspace. In reality, they almost certainly know which page the image is on. A workspace-wide gallery is expensive (N pages × M blocks, paginated, rate-limited) and noisy.

**Smallest test:** Ship page-scoped only. If `io_notion_image_imported` event rate is strong after 2 weeks, expand to multi-page. If <20% of Notion-connected users ever open the drawer, workspace-gallery wouldn't have saved it.

**Pre-build spike (must do first):** From the prod box, call `blocks.retrieve` on a known Notion image block via the OAuth SDK and immediately download the returned `file.url` via `instrumentedAxios`. Confirm: download succeeds, host is `prod-files-secure.s3.amazonaws.com`, `Content-Type` is an image MIME. If Notion restricts file access by Referer or User-Agent, the entire approach needs rethinking before any code is written.

---

## Scope

### In
- "Import from Notion" button in ImageQueue, visible only when user has a valid `notion_tokens` row.
- Right-side drawer: page search (reuses `POST /api/notion/top-level-pages`) → image gallery (calls existing `GET /api/notion/blocks/:id`, client filters `type === 'image'`, up to first 50) → multi-select.
- New endpoint: `POST /api/image-occlusion/draft/notion-image` — takes `{ blockIds: string[] }`, re-resolves each block's URL via `getImageUrl`, fetches server-side via `instrumentedAxios`, uploads to app S3, returns `[{ s3Key, presignedUrl }]`.
- Imported images slot into the IO draft identically to locally-uploaded ones. Persist across refresh.
- Free-tier limit (3 images) respected: cap import client-side, show existing upgrade prompt.
- Telemetry: `io_notion_gallery_opened`, `io_notion_image_imported` with `source=notion`.

### Out (do not build)
- Workspace-wide image gallery / cross-page search — defer to next iteration.
- Any "linked" state where the IO image re-syncs if Notion changes. Once imported, it is a frozen copy.
- Importing non-image blocks (PDFs, files, video, embeds).
- "Remember last selected page" — cheap follow-up, not v1.
- File preview inside the drawer before selecting (thumbnail grid is sufficient).
- Drag-and-drop reordering of gallery results.

---

## User story

As a Notion-connected user with diagrams in my workspace, I want to pick one or more images from a Notion page inside Image Occlusion so that I can start drawing masks immediately without leaving the tab.

## Acceptance criteria

- [ ] "Import from Notion" button renders in ImageQueue only when user has a valid Notion token. Anonymous or disconnected users see nothing — no upsell, no broken state.
- [ ] Clicking opens a right-side drawer (480px desktop, full-screen mobile) over the canvas panel. Left queue panel remains visible.
- [ ] Drawer page picker: search input, debounced 350ms, calls `POST /api/notion/top-level-pages`. Shows page icon + title. No results state handled.
- [ ] Selecting a page calls `GET /api/notion/blocks/:id` and renders image blocks as a 2-column thumbnail grid. Empty state shown if no image blocks.
- [ ] Multi-select: each thumbnail is a toggle. Footer shows live count "Add 3 images" (disabled at 0).
- [ ] Confirming calls `POST /api/image-occlusion/draft/notion-image` with selected `blockIds`. Server re-resolves the URLs, downloads via `instrumentedAxios`, uploads to app S3. Returns `[{ s3Key, presignedUrl }]`.
- [ ] Imported images appear in the queue with a spinner, then resolve — identically to a local upload. Draft auto-saves with the new entries.
- [ ] Notion API failure: `.notificationDanger` with "We couldn't reach Notion just now." and a retry button.
- [ ] Notion token expired (401): "Your Notion connection needs a refresh." with a reconnect link.
- [ ] Not connected: drawer shows `ConnectNotion` card pattern ("Connect your Notion workspace first").
- [ ] `blockIds` validated as Notion UUID format server-side; invalid IDs → 400.
- [ ] Content-Type validated after download; anything outside `image/jpeg|png|webp|gif` → rejected before S3 write.
- [ ] Download size capped at 10 MB (matching multer limit on local uploads).
- [ ] No Notion token, signed Notion URL, or OAuth credential appears in any client response or server log.
- [ ] Unit tests: `ImportNotionImagesUseCase` stubs NotionAPIWrapper + instrumentedAxios + StorageHandler at external edges; covers happy path, null token (401), bad MIME, size over cap, invalid blockId.

---

## Design notes

### Trigger point
In `ImageQueue.tsx`, the existing `+ Add images` dashed button gains a second stacked sibling button beneath it:

```
[ + Upload images           ]   ← existing, dashed style, file picker
[ + Import from Notion      ]   ← new, same dashed style
    Pick a page, pick the images
```

Both are tertiary visual weight. The Download CTA in the footer remains the only primary action.

### Drawer
Right-side drawer slides in over the canvas panel (`transform: translateX(100%) → translateX(0)`). Width 480px desktop, full-screen (375px) mobile. Uses `.modalCard` background + shadow, anchored right. New styles in `ImageOcclusionPage.module.css`: `.drawer`, `.drawerOpen`, `.drawerHeader`, `.galleryGrid`, `.galleryTile`, `.galleryTileSelected`.

### Page picker view
- Search label: `Search your Notion pages` / placeholder: `Type a page name`
- Each row: page icon, title, trailing `Open` button (whole row clickable)
- Loading: `Looking up your pages...`
- No results: `No pages match "{query}". Make sure the page is shared with 2anki.`

### Image gallery view
- Back link: `← Back to pages` + page title in header
- 2-column grid, 200×130 thumbnails, object-fit cover, filename caption below
- Each tile is a checkbox surface; selected state shows check badge top-right
- Loading: skeleton grid + `Loading images from "{pageTitle}"...`
- Empty: `No images on this page yet` / `We only see images that live directly on the page — not links to outside files.` / `← Pick a different page`
- Footer: `Add N images` primary (live count), `Cancel` tertiary link

### Free-tier overflow
`You're on the free plan — only the first 3 images were added.` with existing `Upgrade for unlimited` link. Enforced client-side before calling the import endpoint.

### Error states
- Generic API failure: `We couldn't reach Notion just now. Your connection is fine on our side — Notion is having a moment. Wait a few seconds and try again.` + `Try again` + `Close`
- Auth expired: `Your Notion connection needs a refresh.` + `Reconnect to Notion`

---

## Technical pre-flight

**Effort: M** — server use-case is ~150–200 lines; the React drawer with async states is the bulk.

### Layers touched
`routes` → `controllers` → `usecases` → `services` (NotionAPIWrapper, StorageHandler) → `web`

No new DB schema. No new env vars. No Python changes.

### Files
**Server**
- `src/routes/ImageOcclusionRouter.ts` — add `POST /api/image-occlusion/draft/notion-image` with `RequireAuthentication`
- `src/controllers/IoDraftController.ts` — add `importFromNotion(req, res)` method; validates body; delegates to use case
- `src/usecases/imageOcclusion/ImportNotionImagesUseCase.ts` — new; orchestrates token fetch → block resolve → `instrumentedAxios` download → S3 upload → return `[{ s3Key, presignedUrl }]`
- `src/usecases/imageOcclusion/ImportNotionImagesUseCase.test.ts` — new; stubs at external edges
- `src/services/NotionService/helpers/getImageUrl.ts` — consumed as-is (handles both `external` and `file` types)
- `src/services/NotionService/NotionAPIWrapper.ts` — `getBlock(id)` consumed; no changes
- `src/data_layer/NotionRespository.ts` — `getNotionToken(owner)` consumed; no changes
- `src/lib/storage/StorageHandler.ts` — `uploadFile` + `getPresignedUrl` consumed; no changes
- `src/services/observability/instrumentedAxios.ts` — consumed as-is; `notion` service already allows arbitrary public HTTPS hosts

**Frontend**
- `web/src/pages/ImageOcclusionPage/components/ImageQueue.tsx` — add "Import from Notion" button; pass `isNotionConnected` prop
- `web/src/pages/ImageOcclusionPage/ImageOcclusionPage.tsx` — wire `handleAddFromNotion` callback; fetch `isConnected` from `GET /api/notion/get-notion-link` on mount
- `web/src/pages/ImageOcclusionPage/components/NotionImportDrawer.tsx` — new; PagePickerView + ImageGalleryView
- `web/src/pages/ImageOcclusionPage/ImageOcclusionPage.module.css` — new drawer + gallery styles
- `web/src/pages/AnkifyPage/components/NotionPagePicker.tsx` — reference/mirror for page picker UX (do not modify)
- `web/src/pages/SearchPage/components/ConnectNotion.tsx` — reuse for not-connected empty state

### Security checklist
- `blockIds` from client validated as Notion UUIDs via `isValidNotionId` before SDK calls — rejects prompt-injected IDs
- Notion file URL consumed server-side only via `instrumentedAxios` — client never fetches Notion URLs
- `Content-Type` response header validated against allowed MIME set before S3 write
- Download size checked against 10 MB cap; reject early if `Content-Length` exceeds limit
- Notion token not logged; passed directly to `NotionAPIWrapper` constructor
- SonarCloud: new `instrumentedAxios.get` call for Notion URLs may need a FP mark in the UI (confirm with Alexander before merge)

### Open questions
1. Verify the pre-build spike (see Riskiest assumption above) before writing any code.
2. `getImageUrl` returns `null` for unsupported block types — confirm the use case handles `null` gracefully (skip + log, not throw).
3. The existing multer size limit is `10 * 1024 * 1024` in the router; the use case must enforce the same cap independently since the Notion download bypasses multer.
4. Confirm `instrumentedAxios` `notion` service config allows `prod-files-secure.s3.us-west-2.amazonaws.com` — line 219 of the test suggests yes, but double-check the prod config matches.
