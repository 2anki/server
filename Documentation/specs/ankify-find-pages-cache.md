# Spec: Cache "Find pages" results to fix slow Ankify picker

**Goal**: Make the "Find pages" picker on `/ankify` open instantly on repeat use, without changing the cold-start cost or the result set.

**Goal alignment**: The picker is the first thing a returning user touches when adding a new deck. Today it stalls 4–8s on heavy-database accounts, every single open. A short-TTL server-side cache turns the second open (and every keystroke-debounced re-fetch) into a sub-50ms response — directly serving the "simplest, fastest" mission and unblocking deck creation, the top-of-funnel action toward 300K users.

## Problem (verified)

The Ankify "Find pages" picker (`web/src/pages/AnkifyPage/components/NotionPagePicker.tsx`) calls `POST /api/notion/top-level-pages` on every mount and on every debounced keystroke. The server handler, `NotionAPIWrapper.searchTopLevelPages` at `src/services/NotionService/NotionAPIWrapper.ts:243`, paginates Notion's `search` endpoint up to **20 times** (200 items each) to collect 50 useful top-level pages.

The cost is structural: Notion has no "list workspace pages" API. `search` returns objects sorted by `last_edited_time desc`, which on heavy-database accounts is dominated by database rows. The recent commit `d434d93b` ("bump top-level page search to 20 paginated calls") documents this directly:

> Probed prod: 5 pages of Notion search (500 results) returned 0 useful entries on the test account because the most recently edited 500 items are all rows from one active database. Real top-level pages start showing up around page 6+.

Twenty sequential Notion calls × ~200–400ms each = **4–8s** per request on heavy-DB accounts. Nothing is cached, so the cost is paid on every mount, every navigation back to `/ankify`, and after every debounced keystroke clears the input.

**Why `/notion` (`SearchPage`) feels faster**: it defaults to `query='anki'` (`web/src/pages/SearchPage/helpers/useSearchQuery.tsx:30`). With a non-empty query, Notion does server-side fuzzy matching and returns a small targeted slice in **one** API call. Same workspace, same code path — different default query.

## User-facing change

None visible. The picker behaves identically. First open is unchanged. Subsequent opens within 60s render the previous result list immediately instead of showing "Looking up your pages…" for several seconds.

## Server-side change

Add an in-memory per-owner cache for `searchTopLevelPages` results, keyed by `${owner}:${query.trim().toLowerCase()}`, TTL 60s.

```
NotionService.searchTopLevelPages(query, owner)
  ├── cacheKey = `${owner}:${query.toLowerCase().trim()}`
  ├── if (cache hit && !expired) return cached
  ├── result = client.searchTopLevelPages(...)
  ├── cache.set(cacheKey, result, ttl=60s)
  └── return result

+ NotionService.disconnect(owner) calls cache.invalidateOwner(owner)
```

### Files to touch

- `src/services/NotionService/topLevelPagesCache.ts` (new): a small module exporting `get(key)`, `set(key, value, ttlMs)`, `invalidateOwner(owner)`. Backed by a `Map<string, { value, expiresAt }>` at module scope. ~40 LOC.
- `src/services/NotionService/NotionService.ts:77`: wrap `searchTopLevelPages` with cache lookup/populate.
- `src/services/NotionService/NotionService.ts:155` (`disconnect`): call `invalidateOwner` so a re-connected account doesn't see another user's cached pages on the same process. (Multi-tenant safety.)
- `src/services/NotionService/topLevelPagesCache.test.ts` (new): unit test for hit/miss/expiry/invalidateOwner.

No frontend changes. No new endpoints. No DB migration. No schema change.

## Why 60s and not longer / shorter

- **Long enough** to cover the realistic re-open pattern (open picker → realize you want a different page → close → reopen).
- **Short enough** that a user adding a new top-level page in Notion sees it within a minute without needing manual invalidation.
- Process-local TTL is sufficient: a stale read from another pm2 worker is no worse than today (a fresh fetch). No need for Redis or a shared store.

## Cache key normalisation

Lowercase + trim the query so `"My Page"` and `"my page "` share an entry. Owner is part of the key so cross-tenant leakage is impossible. Don't cache empty-query and non-empty-query under the same key — they're different Notion calls with different result shapes.

## Acceptance criteria

- [ ] Two consecutive `POST /api/notion/top-level-pages` requests with the same body from the same authenticated user issue **one** Notion API call (verified via mocked `notion.search` call count in unit test).
- [ ] A third request 61s later issues a fresh Notion call.
- [ ] Disconnecting Notion (`POST /api/notion/disconnect`) drops the cached entries for that owner; the next picker open does a fresh fetch.
- [ ] Two different users hitting the endpoint do not share cache entries (owner is part of the key).
- [ ] No change to the JSON shape returned to the FE — `NotionPagePicker.tsx` does not need to be touched.
- [ ] Existing `NotionAPIWrapper.searchTopLevelPages` tests still pass unchanged.
- [ ] New `topLevelPagesCache.test.ts` covers: hit, miss, expiry, `invalidateOwner` clears only that owner's keys.

## Out of scope (next iteration)

- **Streaming results** (SSE) so the first batch shows in ~500ms even on cold start. Defer until we measure whether the cache alone is enough.
- **Persistent DB cache** (`notion_top_level_pages` table) — only worth it if process-local cache misses turn out to be common.
- **Force-refresh button** in the picker UI — add only if users complain about staleness within the 60s window.
- **Client-side `sessionStorage` cache** — redundant once the server cache exists; revisit if pm2 worker hashing causes uneven hit rates.
- **Reducing `maxPages` from 20** — `d434d93b` already tuned this; don't relitigate without new prod data.
- **Notion-side filter improvements** — Notion's `search` API has no parent-type filter, so this is a dead end without their API changing.

## Risks and mitigation

- **Stale data within 60s**: a user who just created a new page in Notion won't see it for up to a minute. Acceptable — the picker has no "this list is fresh as of HH:MM:SS" affordance today, and the alternative is the current 4–8s wait.
- **Memory growth**: bounded by `(number of active users in last 60s) × (number of distinct queries per user)`. At our scale this is tiny — a few MB worst case. If we ever need to bound it harder, swap to an LRU; not needed today.
- **pm2 cluster split**: each worker has its own Map. A user pinned to worker A who later hits worker B pays one fresh fetch. No correctness issue. Sticky sessions or a shared store can come later if hit-rate telemetry warrants it.
- **Test isolation**: cache lives at module scope. Tests must reset it between cases (export a `__resetForTests` helper or use `vi.resetModules`).

## Commit message guidance

Use `perf(ankify):` prefix. Reference the root cause from `d434d93b` so the chain of fixes is traceable. Example body:

> Find-pages picker calls `searchTopLevelPages` on every mount and every
> debounced keystroke. On heavy-DB accounts each call does up to 20
> sequential Notion search pages (~4–8s) because top-level pages are
> buried under DB rows in `last_edited_time` order — see d434d93b.
>
> Add a per-owner in-memory cache (60s TTL) so repeat opens hit the
> cache instead of Notion. Cold start is unchanged. Cache is dropped
> when the user disconnects Notion.
>
> Future scope (deferred, not in this PR): streaming/SSE for cold-start
> latency, and a persistent cache if process-local hit rate proves
> insufficient.
