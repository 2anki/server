## Spec: Block-cache correctness and bypass fix

### Trio synthesis
- **PM**: Two audit findings must ship together — a cross-user correctness bug (one user's cache fetches can clobber another's row) plus a perf bypass (`getTopLevelTags` skips the cache, costing one Notion API RTT per page). Notion-path conversion is our largest conversion source; closing both unlocks meaningful tail-latency wins without API changes.
- **Designer**: No UI changes required. Faster Notion conversions look identical to slow ones — same upload screen, same job progress.
- **Engineer**: Touches `src/data_layer/repositories/BlocksCacheRepository.ts` (add `owner` filter on `UPDATE` and `onConflict`), `src/services/NotionService/NotionAPIWrapper.ts` (`getTopLevelTags` signature widens to accept `createdAt`/`lastEditedAt`), and `src/services/NotionService/BlockHandler.ts` (caller plumbs the timestamps). M effort. The trap: the audit's one-line "pass `all: true`" fix doesn't actually populate the cache — `save()` is guarded on non-empty `createdAt`/`lastEditedAt`, so you'd pay for full pagination without ever writing a row.
- **Agreement**: ship the owner-filter correctness fix first (separate commit / PR), then the cache-plumbing change as a second commit on the same branch.
- **Conflict**: original audit proposal was a one-line `all: true` flip; cross-review showed it would silently pay the cost without the benefit. Resolved by widening the fix to plumb real timestamps.
- **Resulting plan**: two-stage fix — Stage A correctness, Stage B perf — both behind this single spec.

**Outcome**: Cut 200–2000 ms per top-level page off Notion-path conversion (one Notion API RTT per page eliminated on warm cache). Close the cross-user `blocks` cache clobber.

**Goal alignment**: Notion is our largest conversion source; faster Notion improves the "first-deck-in-session" leading indicator. The cross-user clobber is a correctness baseline we can't ignore at scale.

**Problem**:
- *(Correctness, D-H8)* `BlocksCacheRepository.get` fires a fire-and-forget `UPDATE blocks SET fetch = fetch + 1 WHERE object_id = $1` with no `owner` predicate. If two users share a Notion page ID (rare but possible via shared Notion databases), one user's read silently increments a row that doesn't belong to them. The `onConflict('object_id').merge()` in `save()` compounds this — one user's entry can clobber another's.
- *(Perf, D-H3)* `NotionAPIWrapper.getTopLevelTags(pageId, rules)` calls `getBlocks(all=undefined)`. The cache is gated on `all && this.blocksCache`, so the path always hits Notion API live — adding 200–2000 ms RTT per top-level page on every conversion.

**Riskiest assumption**: That adding `owner` to the `UPDATE` predicate (Stage A) and threading `createdAt`/`lastEditedAt` through `getTopLevelTags` (Stage B) doesn't change cache contents in a way that breaks the existing block-fetch flow for paying users.

**Smallest test**: A local Postgres seed with two users + the same `object_id`, plus a test that asserts `get` for user A does not affect user B's row. For Stage B, snapshot the existing block list returned by `getTopLevelTags` for a known fixture page and assert it's unchanged after the cache plumbing change.

**Scope**
- **In, Stage A (`fix:`)**: Add `AND owner = $2` to the fetch-counter `UPDATE` in `BlocksCacheRepository.get`. Add `AND owner = ?` to the `onConflict` upsert predicate in `save`. Add an integration test asserting cross-user isolation.
- **In, Stage B (`perf:`)**: Widen `getTopLevelTags(pageId, rules, createdAt, lastEditedAt)`. Update the caller in `BlockHandler.ts:317` to pass real timestamps. Pass `all: true` so the cache lookup and `save()` guard both fire.
- **Out**: Migrating the `blocks` table from `json` to `jsonb`. Adding GIN indexes. Switching the cache to a separate keyspace.
- **Out**: Notion webhook receiver (intentionally inactive per `routes/AnkifyWebhookRouter.ts`).

**User story**: As a Notion-connected user converting a 10-page page tree, I want repeated conversions of the same tree to be roughly twice as fast so I'm not waiting 10–20 extra seconds for a deck I already converted yesterday.

**Acceptance criteria**
- [ ] `BlocksCacheRepository.get` and `save` both filter on `owner` — verified by a two-user integration test.
- [ ] `getTopLevelTags` plumbs `createdAt` / `lastEditedAt` and writes to `blocks` cache on first call.
- [ ] On a 10-page synthetic Notion tree (warm cache), the second conversion completes ≥ 30 % faster than the first.
- [ ] Existing Notion path tests pass with no modification.

**Open questions**
- Do any other call sites of `BlocksCacheRepository.get` pass an `owner` of `0` or missing user ID? Audit before commit.
- Is `lastEditedAt` available at the `getTopLevelTags` call site, or does it need to be fetched separately? (Defeating the purpose if so.)

**Out of scope (next iteration)**: Block-cache eviction policy, jsonb migration, OAuth-token-scoped cache keys.

### Technical pre-flight
- **Layers touched**: `src/data_layer/repositories/BlocksCacheRepository.ts`, `src/services/NotionService/NotionAPIWrapper.ts`, `src/services/NotionService/BlockHandler.ts`.
- **Cross-language**: none.
- **Effort**: M — DB-level correctness fix on Stage A, signature change on Stage B touches one caller.
- **Security / testing**: Stage A is correctness; add the cross-user isolation test. Stage B: snapshot test on block-list output to prove the cached path returns identical data.
- **Migration concerns**: none — no schema change. Existing rows are fine; the `WHERE` clause just gets stricter.
