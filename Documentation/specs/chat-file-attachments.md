# Spec: Chat composer file attachments (PR-3)

### Trio synthesis

- **PM**: Ship PDF + image attachments only; cap at 10 MB/file, ≤5/message; one upload = one message against the free-tier 20/month quota; metric is ≥20% of new chats include an attachment within 14 days of ship.
- **Designer**: One paperclip + drag-drop on the composer. Per-chip loading and error states with retry. Placeholder updates to "…or attach a PDF…". Quota messaging stays in the existing usage line — no paperclip tooltip.
- **Engineer**: Reuse `POST /api/chat/message`, upgrade to multipart. Skip attachments table + S3 in v1 — in-memory only, never persisted. Anthropic content blocks (`image` + `document`). Magic-byte check via `file-type`. Effort = M.
- **Agreement**: PDFs + images only. 1 upload = 1 message. Magic-byte validation. Audio + "any file format" hard-cut.
- **Conflict**: PM wanted reload-rehydration; engineer pushed back on persistence cost for v1; designer's UI presumed it. **Resolved in engineer's favor**: v1 is send-only, no rehydration. PM's persistence acceptance criterion moves to a follow-up gated by the success metric.
- **Resulting plan**: Memory-only multipart upload via the existing `/api/chat/message` endpoint. PDFs + images, 10 MB each, max 5 per message, magic-byte validated. Composer gets a paperclip + drag-drop with per-chip states. Persistence + rehydration deferred to PR-3b if the metric warrants.

---

**Outcome**: Within 14 days of ship, **≥20% of new chats include at least one attachment**, and attachment-containing chats produce a downloadable deck at ≥1.2× the rate of text-only chats. If neither lands, attachments aren't the bottleneck and we stop layering chat.

**Goal alignment**: Most study material lives in PDFs (lecture slides, textbook chapters) and images (photos of handwritten notes, screenshots). Dropping these straight into chat is the shortest path from "what I'm studying" to "Anki deck" — the mission in `CLAUDE.md`. It also unlocks a use case the Notion-export upload path doesn't cover: a phone-camera photo of a page.

**Problem**: Today a learner with a lecture slide PDF or a photo of textbook notes has to either copy-paste text (losing diagrams + structure) or abandon chat for the upload page (losing conversation context). PR-1 and PR-2 made chat persistent and draftable; the next bottleneck is that the composer only accepts text. Specific instance: a Patreon user (Discord, 2026-04) asked *"can I just paste my anatomy slides in here?"* — the answer today is no.

**Riskiest assumption**: That ≥20% of chat users actually have a PDF or image they want to attach in a real session. If chat usage skews toward "type a prompt and iterate," attachments will be a low-leverage surface and the engineering cost won't earn its keep.

**Smallest test**: Before full pipeline, ship a one-week instrumented prompt in the empty-chat state — *"Have a PDF or image? Attachments are coming — tell us what you'd drop in."* Click-through + free-text capture. If <10% of chat-openers click, rescope to PDF-only and skip images.

**Scope**:

*In:*
- Composer paperclip button + drag-and-drop onto the chat area.
- File types: `application/pdf`, `image/png`, `image/jpeg`, `image/webp`, `image/gif`.
- Size caps: **10 MB per file, 25 MB per message total, max 5 attachments per message**.
- **Magic-byte validation** via `file-type` — declared MIME must match detected bytes.
- Quota: **1 upload = 1 message** against the 20/month free-tier cap. Patreon + Stripe subscribers unlimited (existing `hasChatAccess` path).
- Attachments sent to Anthropic via `image` + `document` content blocks. **Bytes held in memory for the duration of the request only — not persisted.**
- Errors per VOICE.md (exact strings in Design notes).

*Out (this PR):*
- Audio (hard-cut — Anthropic doesn't read it; would need Whisper).
- "Any file format" (hard-cut — Claude can't read .docx/.pptx/.xlsx natively; use existing converter).
- **Attachment persistence / reload-rehydration** — deferred to PR-3b, gated by the success metric.
- PDF page-range selection.
- Attachment library / search.
- Thumbnails of PDF page 1 in the chip.
- EXIF stripping from images (revisit if a user reports it).

**User story**: As a learner with a lecture slide PDF or a photo of my notes, I want to drop the file straight into the chat composer so that I can ask Claude to turn it into Anki cards without leaving the conversation.

**Acceptance criteria**:
- [ ] Composer accepts drag-and-drop and paperclip-click upload of PDF/PNG/JPG/WebP/GIF.
- [ ] Server rejects non-allowlisted MIME, oversized files, >5 attachments, and magic-byte mismatch with the exact copy in Design notes.
- [ ] Each user message with attachment(s) decrements the free-tier 20-msg counter by 1 (not by attachment count).
- [ ] The current user turn is delivered to Anthropic as a mixed-content `MessageParam` (`image`/`document` blocks + final `text` block).
- [ ] No attachment bytes are written to disk or S3. Multer uses `memoryStorage()`.
- [ ] Filename never used as a filesystem path; `getSafeFilename` applied to any logged surface.
- [ ] Per-chip loading + per-chip error states + chip-level retry per Design notes.
- [ ] Jest covers controller + use case + `buildAttachmentBlocks`; vitest covers the composer component; one Playwright happy-path e2e.

**Open questions**:
- Does `claude-haiku-4-5-20251001` accept `document` blocks? Engineer to verify against `@anthropic-ai/sdk` types before implementation. If not, gate document attachments to premium-only for v1.

**Out of scope (next iteration)**:
- PR-3b: persistence + reload-rehydration. Triggered by the success metric — if attachments earn ≥20% inclusion rate, build the `chat_message_attachments` table + S3 bucket + signed-URL fetch.

---

## Design notes

### Composer layout

```
┌──────────────────────────────────────────────────────────────┐
│  [PDF] Chapter-3-pharmacology.pdf · 2.4 MB           [×]     │
│  [IMG] anatomy-diagram.png · 1.1 MB                  [×]     │
├──────────────────────────────────────────────────────────────┤
│  Ask a study question, paste notes, or attach a PDF…         │
│                                                              │
│  [📎]                                              [Send →]  │
└──────────────────────────────────────────────────────────────┘
   20 of 20 messages left this month
```

- Paperclip mirrors the send button (bottom-left vs bottom-right), same `btnIcon` styling.
- Chips sit **above** the textarea inside the same composer card; the textarea height never changes because of attachments. After 4 rows, the chip strip scrolls within `max-height: 6.5rem`.
- Drag-and-drop highlights the whole composer with a 2px dashed `--color-primary` border and a centered label: **"Drop to attach"** / *"PDF or image, up to 10 MB each"*.

### Chip anatomy

- Icon (16px, muted): PDF glyph or image glyph.
- Filename: medium weight, truncate at 32 chars desktop / 20 mobile, full name in `title`.
- Separator: middle dot ` · ` in `--color-text-tertiary`.
- Size: tabular numerals, `850 KB` or `2.4 MB` (1024-base, one decimal for MB+).
- Remove: 24×24 hit target, `aria-label="Remove {filename}"`. No red — routine, not destructive.
- Border: 1 px `--color-border`, radius `--radius-md` (rectangle, not pill).
- States:
  - Uploading: size swaps to `Uploading` in muted text + 12 px `spinnerSmall`.
  - Failed: size swaps to `Upload failed` in `--color-danger`, chip border picks up `--color-danger-border`, `[Retry]` link appears. After 2 failed retries, the chip auto-removes and a banner appears.

### Empty-state placeholder

Update: `Ask a study question, paste notes, or attach a PDF…`

### Copy strings (sentence case, no trailing period on labels)

| Surface | String |
|---|---|
| Composer placeholder | `Ask a study question, paste notes, or attach a PDF…` |
| Paperclip `aria-label` | `Attach files` |
| Drop overlay title | `Drop to attach` |
| Drop overlay sub | `PDF or image, up to 10 MB each` |
| Chip remove `aria-label` | `Remove {filename}` |
| Chip — uploading | `Uploading` |
| Chip — failed | `Upload failed` |
| Chip retry button | `Retry` |
| Error — bad type, single | `Can't attach {filename}. Only PDF and image files work here.` |
| Error — bad type, multi | `Can't attach {N} files. Only PDF and image files work here.` |
| Error — file too large | `{filename} is {size}. The per-file limit is 10 MB.` |
| Error — batch too large | `That's {total} total. A message can carry up to 25 MB across all files.` |
| Error — upload failed (banner, after retries) | `Couldn't upload {filename}. Check your connection and try again.` |
| Usage line at 1 left | `1 message left this month — your next send uses it` |

### Quota messaging

The existing `X of 20 messages left this month` line is the single source of truth. Each send = 1 message regardless of attachment count. No tooltip on the paperclip (hover doesn't exist on mobile, duplicates the line that's already on-screen).

### Mobile

Chips stack one per row. Filename truncates harder (20 chars). Paperclip + remove + send all grow to 44×44 hit targets.

---

## Technical pre-flight

### Layers touched

- **routes** — `src/routes/ChatRouter.ts`: conditional multer middleware on `POST /api/chat/message`.
- **controllers** — `src/controllers/ChatController.ts`: parse `req.files`, validate count/size/MIME, run magic-byte check.
- **usecases** — `src/usecases/chat/ChatUseCase.ts`: accept `attachments`, build mixed-content `MessageParam`. New pure helper `src/usecases/chat/buildAttachmentBlocks.ts`.
- **services** — none in v1.
- **data_layer** — none in v1.
- **web** — `web/src/pages/Chat/ChatPage.tsx` + `ChatPage.module.css`: file input, drag-drop, chip strip, error states. `web/src/lib/backend/api.ts`: a `postMultipart` helper (or extend `post`).

### Storage decision: memory only

Multer `storage: multer.memoryStorage()`. Bytes are held as `Buffer` in `req.files`, base64-encoded for Anthropic, then GC'd. No temp files, no S3, no cleanup job.

Why not S3: persistence is out of scope; grafting onto the legacy AWS v2 `StorageHandler` for ephemeral bytes adds latency, cost, and a failure surface for no payoff. When PR-3b adds rehydration, switch to S3 with a `chat-attachments/` prefix and a 24h signed-URL pattern.

### API shape: upgrade existing endpoint to multipart

Keep `POST /api/chat/message`. Switch the client to `FormData` when attachments are present; JSON path still works for text-only sends. Express 5 + multer skips parsing when `Content-Type` isn't `multipart/form-data`. Avoids duplicating SSE, rate-limit, and conversation-resolution logic across two endpoints.

### Anthropic integration

```ts
const userContent: Anthropic.ContentBlockParam[] = [
  ...attachments.map(toContentBlock),  // images first, then PDFs
  { type: 'text', text: content },
];
messages.push({ role: 'user', content: userContent });
```

- `image`: `{ type: 'image', source: { type: 'base64', media_type, data } }`
- `document`: `{ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data } }`

History entries stay as plain `{ role, content: string }`. `chat_messages.content` stores the plain text only.

### Validation gates (server-side)

| Check | Cap | Error |
|---|---|---|
| File count | ≤ 5 | 400 |
| Per-file size | ≤ 10 MB | 400 (also `limits.fileSize` on multer for early rejection) |
| Total size | ≤ 25 MB | 400 |
| MIME allowlist | `image/png`, `image/jpeg`, `image/gif`, `image/webp`, `application/pdf` | 400 |
| Magic bytes | declared MIME matches `fileTypeFromBuffer` result | 400 |
| Text length | existing `MAX_CONTENT_LENGTH` (4 000 free / 100 000 premium) | 400 |
| Quota | existing `countThisMonth` ≥ 20 for free | 429 (SSE `rate_limit`) |

### Security

- **Path traversal (CWE-22)**: `memoryStorage` never writes to disk; `originalname` is never used as a filesystem path. Still pass through `getSafeFilename` before any logging.
- **Type mismatch**: `file-type` (`fileTypeFromBuffer`) on the first 4 KB; reject declared/detected mismatch. Closes the renamed-`.exe` vector.
- **SSRF**: not applicable; bytes go to Anthropic via `getAnthropicClient()`, no user-supplied URLs.
- **Memory pressure**: 5 × 10 MB = 50 MB per request. Multer holds the full buffer; for a single Node process this is bounded by request concurrency. Document the implicit limit; revisit if memory alerts fire.

### Cross-language coordination

None. The Python `create_deck/` bridge consumes `deck_info.json` (front/back strings). Attachments are inputs to Claude, not outputs to Anki. No schema change to `deck_info.json`.

### Effort: M

Two layers of non-trivial change (controller multipart + use case content-blocks), `file-type` integration for magic bytes, meaningful composer rebuild. Tests across three layers. Not large but more surface than a typical fix.

### Test plan

- **Jest**: `buildAttachmentBlocks.test.ts` (pure unit, image + document shapes); extend `ChatController.test.ts` (>5 files → 400, >10 MB → 400, magic-byte mismatch → 400, happy path passes attachments to use case); extend `ChatUseCase.test.ts` (attachments produce mixed-content user turn).
- **Vitest**: `ChatPage.test.tsx` (file input + drag-drop add chips; remove chip drops it; send posts `FormData`; over-limit shows the exact error copy).
- **Playwright**: one happy-path e2e — log in, attach a small PNG, send, verify `done` event + card list renders.

### Rollback

Revert + redeploy. No migration, no persisted state. Optionally gate behind `ENABLE_CHAT_ATTACHMENTS=true` env var if extra insurance is wanted.

---

## Roadmap appendix — where we landed on X

### Deferred (revisit on signal)
- **PR-3b: attachment persistence + reload-rehydration** — triggered if PR-3 hits the ≥20% inclusion metric.
- **Folders for conversations** — revisit when the median user crosses ~30 saved chats; sidebar fits ~50 before scroll fatigue.
- **Pinned conversations** — cheaper precursor to folders; same trigger.
- **Model picker (Sonnet / Opus / Haiku)** — adds decision fatigue for learners who just want cards; revisit only if cost or latency complaints surface.
- **Tone presets** ("explain like I'm new", "exam mode") — interesting but unproven; needs its own discovery before scoping.
- **Temporary / incognito chat** — low-signal request count; cheap to add later.

### Hard-cut (not coming back without new evidence)
- **Audio attachments** — Anthropic can't read audio; would require Whisper, a transcription quota, and a different abuse surface. Its own spec or nothing.
- **"Any file format" (.docx, .pptx, .xlsx, .epub)** — Claude can't read these natively; pretending they "just work" ships a worse experience than the existing converter. Chat stays PDF + images; use the upload page for those formats.
