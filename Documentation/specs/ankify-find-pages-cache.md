# Spec: Cache "Find pages" results to fix slow Ankify picker

**Goal**: First batch of results in the `/ankify` "Find pages" picker shows in **<200ms** for the empty-query case (initial mount) across all account sizes — including heavy-database accounts where today it stalls 4–8s.

**Goal alignment**: The picker is the first thing a returning user touches when adding a new deck. A sub-200ms first paint serves the "simplest, fastest" mission directly and unblocks deck creation, the top-of-funnel action toward 300K users.

## Problem (verified)

The Ankify "Find pages" picker (`web/src/pages/AnkifyPage/components/NotionPagePicker.tsx`) calls `POST /api/notion/top-level-pages` on every mount and on every debounced keystroke. The server handler, `NotionAPIWrapper.searchTopLevelPages` at `src/services/NotionService/NotionAPIWrapper.ts:243`, paginates Notion's `search` endpoint up to **20 times** (200 items each) to collect 50 useful top-level pages.

The cost is structural: Notion has no "list workspace pages" API. `search` returns objects sorted by `last_edited_time desc`, which on heavy-database accounts is dominated by database rows. The recent commit `d434d93b` ("bump top-level page search to 20 paginated calls") documents this directly:

> Probed prod: 5 pages of Notion search (500 results) returned 0 useful entries on the test account because the most recently edited 500 items are all rows from one active database. Real top-level pages start showing up around page 6+.

Twenty sequential Notion calls × ~200–400ms each = **4–8s** per request on heavy-DB accounts. Nothing is cached, so the cost is paid on every mount, every navigation back to `/ankify`, and after every debounced keystroke clears the input.

**Why `/notion` (`SearchPage`) feels faster**: it defaults to `query='anki'` (`web/src/pages/SearchPage/helpers/useSearchQuery.tsx:30`). With a non-empty query, Notion does server-side fuzzy matching and returns a small targeted slice in **one** API call. An empty-query `/notion` would be just as slow — same code path, different default query. So `/notion` is a useful diagnostic, not a benchmark we can match without changing where the data comes from.

## Why <200ms requires not calling Notion in the hot path

Each `notion.search` call is ~200–400ms round-trip. On heavy-DB accounts the *first* call returns zero useful entries — useful pages don't appear until page 6+. Streaming/SSE doesn't help because there's nothing to stream in the first 200ms. Notion's `search` is cursor-only, so calls can't be parallelised. The only way to reliably hit <200ms is to read from a local cache that was populated out-of-band.

This spec therefore has two tiers, intended to land **together** in one PR:

- **Tier 1** — in-memory per-process cache (60s TTL) for repeat-open and debounced-keystroke wins.
- **Tier 2** — persistent DB cache + stale-while-revalidate, populated by the existing Ankify poll job, for cold-start and cross-process wins.

Reads check Tier 1 → Tier 2 → live Notion in that order. Writes populate both tiers.

## User-facing change

None visible. The picker behaves identically; it just renders results in <200ms instead of 4–8s.

## Server-side change

### Tier 1 — in-memory cache

Per-owner in-memory cache keyed by `${owner}:${query.trim().toLowerCase()}`, TTL 60s. Lives at module scope in `src/services/NotionService/topLevelPagesCache.ts`. Backed by a `Map<string, { value, expiresAt }>`. Invalidated when the user disconnects Notion.

### Tier 2 — persistent DB cache + stale-while-revalidate

New table `notion_top_level_pages`:

```
notion_top_level_pages
  owner            integer  not null  references users(id) on delete cascade
  notion_page_id   text     not null
  title            text     not null
  icon             jsonb    null
  url              text     null
  parent_type      text     not null
  last_edited_time timestamptz not null
  cached_at        timestamptz not null default now()
  primary key (owner, notion_page_id)
  index (owner, cached_at)
```

Stored only for the empty-query case (the slow path). Typed queries continue to hit Notion live — they're already fast because Notion filters server-side, and persisting per-query results would explode the table.

**Read path** (empty query):
1. Tier 1 hit → return.
2. Tier 2 rows for owner exist → return them immediately. If the newest `cached_at` is older than 5 min, fire-and-forget a background refresh (don't await).
3. Tier 2 empty (first time ever) → live fetch, populate both tiers, return.

**Read path** (typed query): Tier 1 → live Notion (unchanged). No Tier 2 involvement.

**Write path** (background refresh):
- Triggered by the existing **5-min Ankify poll job** that already runs per owner (`scheduleAnkifyPolling.ts` and friends — confirm exact entry point during implementation).
- Calls `client.searchTopLevelPages('')`, replaces all rows for that owner in a single transaction (`delete where owner = ? ; insert ...`).
- Also triggered once on Notion connect, off the request path, so the user's first picker open is already warm.

**Invalidation**:
- `NotionService.disconnect(owner)` deletes Tier 2 rows and calls `Tier 1 invalidateOwner`. (FK `on delete cascade` from `users` covers account deletion.)

### Files to touch

- `src/services/NotionService/topLevelPagesCache.ts` *(new, ~40 LOC)* — Tier 1 module: `get`, `set`, `invalidateOwner`, `__resetForTests`.
- `migrations/<timestamp>_create_notion_top_level_pages.ts` *(new)* — Tier 2 table per schema above.
- `src/data_layer/NotionTopLevelPagesRepository.ts` *(new, ~80 LOC)* — `getByOwner(owner)`, `replaceForOwner(owner, rows)`, `deleteByOwner(owner)`, `newestCachedAt(owner)`.
- `src/services/NotionService/NotionService.ts:77` — wrap `searchTopLevelPages` with the two-tier read path described above. Empty-query branch reads Tier 2; non-empty branch only uses Tier 1.
- `src/services/NotionService/NotionService.ts:155` (`disconnect`) — delete Tier 2 rows; call Tier 1 `invalidateOwner`.
- Notion connect handler (`NotionController.connect` at `src/controllers/NotionController.ts:93` or its downstream `connectToNotion` use case) — fire-and-forget initial Tier 2 warm.
- Ankify poll job entry point — add a per-owner Tier 2 refresh step. (Identify exact file during implementation; do not rewire scheduler shape.)
- Tests:
  - `topLevelPagesCache.test.ts` *(new)* — hit/miss/expiry/invalidateOwner.
  - `NotionTopLevelPagesRepository.test.ts` *(new)* — round-trip, replaceForOwner is atomic, deleteByOwner.
  - `NotionService.searchTopLevelPages.test.ts` *(new or extended)* — read path priority (Tier 1 > Tier 2 > live), stale-while-revalidate fires non-blocking refresh, typed queries skip Tier 2.

No frontend changes. No new endpoints.

## Why 60s (Tier 1) and 5 min (Tier 2)

- **Tier 1 / 60s**: covers re-open patterns and debounced keystroke flutter without holding stale data long.
- **Tier 2 / 5 min stale window**: matches the Ankify poll cadence, so refresh costs are amortised onto an existing job. User sees stale list instantly while refresh runs in the background — staleness is invisible.
- Both are tunable via constants; revisit only if telemetry says so.

## Acceptance criteria

- [ ] **Cold first open**: a user with no Tier 2 rows sees results within the live-fetch latency (unavoidable). Subsequent opens within 5 min read from Tier 2 in <50ms server time.
- [ ] **Warm open** (after Notion connect-time pre-warm or at least one prior fetch): `POST /api/notion/top-level-pages` with empty query returns in <200ms end-to-end on a heavy-DB account.
- [ ] **Stale-while-revalidate**: when Tier 2's newest `cached_at` is >5 min old, the response returns immediately with cached rows AND a background refresh runs (verified via mocked clock + spy on `client.searchTopLevelPages`).
- [ ] **Typed queries skip Tier 2** — verified by asserting Tier 2 read is not invoked for `query !== ''`.
- [ ] **Disconnect drops Tier 2** — `NotionService.disconnect(owner)` removes all rows for that owner and clears Tier 1.
- [ ] **Cross-tenant isolation** — two users hitting the endpoint cannot see each other's cached pages.
- [ ] **No FE change** — `NotionPagePicker.tsx` is untouched; JSON response shape is identical.
- [ ] **Existing `NotionAPIWrapper.searchTopLevelPages` tests pass unchanged.**
- [ ] **New tests** cover Tier 1 (`topLevelPagesCache.test.ts`), repository round-trip (`NotionTopLevelPagesRepository.test.ts`), and read-path priority + stale-while-revalidate behaviour (`NotionService.searchTopLevelPages.test.ts`).
- [ ] **Connect pre-warm** is fire-and-forget — the connect flow does not await it, and a failed warm does not break connect.
- [ ] **Poll-job refresh** runs per owner on the existing 5-min cadence and uses `replaceForOwner` so the table never has duplicates or partial state.

## Out of scope (next iteration)

- **Streaming results (SSE)**: not needed — Tier 2 makes the cold path moot.
- **Cross-process / Redis cache**: Tier 2 is in Postgres, which is already shared across pm2 workers.
- **Force-refresh button** in the picker UI — only if users complain about staleness within 5 min.
- **Client-side `sessionStorage` cache** — redundant.
- **Reducing `maxPages` from 20** — `d434d93b` already tuned this; don't relitigate.
- **Notion webhook subscription** for instant invalidation — interesting follow-up; defer until we measure whether 5-min staleness is a real complaint.
- **Persisting typed-query results** — explosion of cache space for marginal benefit; Notion already handles typed queries fast.
- **Retiring `/notion`'s `SearchPage`** — separate roadmap item.

## Risks and mitigation

- **Stale data within 5 min**: a user who just created a page in Notion won't see it for up to 5 min. Acceptable — the picker has no freshness affordance today, and the alternative is the current 4–8s wait. Future Notion-webhook follow-up would close this.
- **Migration risk**: new table only, no schema change to existing tables, no backfill required (table starts empty; populated lazily). Rollback = drop the table.
- **Background refresh failures**: a thrown error inside the fire-and-forget refresh must not crash the request or the poll job. Wrap in try/catch with `console.error`. Existing `withRetry` already covers Notion API flakiness.
- **Poll-job amplification**: adding a Notion call per owner per 5 min is non-trivial at scale. Mitigation: only refresh owners with an active Notion connection (already a precondition for the poll job) and skip if `newestCachedAt` is fresher than 5 min (e.g., a recent live fetch already populated it).
- **Memory growth (Tier 1)**: bounded by active users × distinct queries in last 60s. Tiny at our scale; swap to LRU only if it ever matters.
- **Test isolation (Tier 1)**: cache lives at module scope. Export a `__resetForTests` helper or use `vi.resetModules` between cases.
- **Disconnect race**: a refresh in flight when the user disconnects could re-populate rows after the delete. Mitigation: refresh writer checks the user still has a Notion token before writing, or wraps the write in a transaction that re-reads the token first. Cheap and correct.

## Commit message guidance

Use `perf(ankify):` prefix. Reference `d434d93b` for the root cause. Example body:

> Find-pages picker calls `searchTopLevelPages` on every mount and every
> debounced keystroke. On heavy-DB accounts each call does up to 20
> sequential Notion search pages (~4–8s) because top-level pages are
> buried under DB rows in `last_edited_time` order — see d434d93b.
>
> Add a two-tier cache: in-memory per-process (60s TTL) for repeat-open
> wins, plus a persistent `notion_top_level_pages` table refreshed by
> the existing 5-min Ankify poll job for cold-start wins. Reads are
> stale-while-revalidate, so the picker renders <200ms across account
> sizes and a background refresh closes the staleness gap silently.
>
> Future scope (deferred): Notion webhook subscriptions for instant
> invalidation, and a force-refresh affordance in the picker UI.
