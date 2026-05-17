# NotionService

Wraps the Notion SDK (`@notionhq/client`) and the OAuth dance. Owns token storage hand-off, top-level-page caching, and block walking for the converter.

## Responsibilities

- **OAuth:** `getNotionAuthorizationLink` and the redirect handler in the controller layer. Tokens land in `INotionRepository`.
- **Top-level pages cache:** `topLevelPagesCache` + `topLevelPagesRefreshGate` — pages are stale after `TOP_LEVEL_PAGES_STALE_AFTER_MS` (5 minutes). The gate prevents thundering-herd refreshes when many tabs hit the picker at once.
- **Block walking:** `BlockHandler/` and `blocks/` recursively fetch a page's blocks and hand them to the parser. Pagination, image URL refresh, and rate-limit handling live here.
- **File uploads:** `NotionAPIWrapper.uploadFile` uses the Notion file uploads API (`fileUploads.create` + `fileUploads.send`) to upload media (images) to Notion's storage. Returns a `file_upload` ID that can be referenced in image blocks. Used by the APKG import flow.
- **Identity helpers:** `getNotionId`, `isValidNotionId`, `NotionColors`.

## Calling pattern

Every outbound call must go through `instrumentedAxios` (from `services/observability/`) or the wrapped `NotionAPIWrapper.ts`. Do not import `axios` or call `notion.request` directly from this dir.

## Things to know before editing

- **Authorize URL needs `redirect_uri`:** `getNotionAuthorizationLink` must include the `redirect_uri` query param (sourced from `NOTION_REDIRECT_URI`). Notion rejects the authorize request with "Missing or invalid redirect_uri" if it's absent. The companion `redirect_uri` on the token exchange (`oauth/token`) is separate but must match.
- **Cache invalidation:** writes (e.g. user disconnects, token refresh) call `invalidateTopLevelPagesForOwner`. Forgetting this leaves stale pages visible to other tabs for up to 5 minutes.
- **Refresh gate:** `tryClaimRefresh` returns false for the second concurrent caller — that caller should serve stale data, not block. Don't change this to a mutex without thinking about the perf tail.
- **Webhooks:** the receiver in `routes/AnkifyWebhookRouter.ts` is intentionally inactive; see `Documentation/ankify/notion-webhooks-deferred.md`. Polling at 5 min carries the near-realtime story today.
- **Token hashing:** never log raw tokens. Use `hashToken` from `lib/misc/hashToken` for any audit trail.
- The Notion SDK throws `APIErrorCode.RateLimited` — handle by surfacing a user-friendly message ("Notion is busy, retry in a moment"), not by silently retrying.
