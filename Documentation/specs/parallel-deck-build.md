## Spec: Bounded-parallel Python deck builds

### Trio synthesis
- **PM**: Multi-page Notion exports today wait ~21 s for a 100-page upload because `getPackagesFromZip` spawns Python serially; the largest visible latency complaint surface we can fix without touching deck semantics.
- **Designer**: No UI changes required — same upload screen, same progress indicator, just faster completion.
- **Engineer**: Single file (`src/usecases/uploads/getPackagesFromZip.ts`). Replace `for...of await` with bounded concurrency via `p-limit`. S effort. The trap: unbounded `Promise.all` would OOM the prod VPS at ~50 MB RSS × N Python processes.
- **Agreement**: ship bounded, capped at 4 concurrent spawns.
- **Conflict**: cross-review caught the unbounded variant as a hard reject; bounded is the only safe shape.
- **Resulting plan**: replace the serial loop with `pLimit(4)`-wrapped concurrent dispatch; no semantics changes, no API surface changes.

**Outcome**: Cut p95 100-page-Notion-export wall-clock from ~21 s to ~5 s. Move conversion-success latency p90 under 6 s for paying-user-sized exports.

**Goal alignment**: Removes the single biggest delay in the multi-page Notion conversion flow. Moves the "first-deck-in-session" leading indicator we use to predict whether a new visitor returns.

**Problem**: A paying user converting a 100-page Notion export waits ~21 seconds while `getPackagesFromZip` calls `PrepareDeck` → `CardGenerator.run` → `spawn(python3, …)` serially, once per HTML file. Python cold-start dominates each spawn (~141 ms baseline, ~210 ms with deck work). Concurrent dispatch with a sane cap drops total wall-clock to roughly one spawn's duration × ⌈N/cap⌉.

**Riskiest assumption**: That 4 concurrent Python spawns plus the parent Node process do not OOM the prod VPS under realistic concurrent-user load.

**Smallest test**: Run a 100-file synthetic zip locally with `pLimit(4)`; measure peak RSS. Re-run on the prod box at low traffic with the same zip and read `pm2 logs` + `/api/ops` memory before/after. If RSS stays under the existing alert threshold, ship; if not, drop the cap to 2.

**Scope**
- **In**: Replace `for...of await` in `src/usecases/uploads/getPackagesFromZip.ts` with bounded-concurrent dispatch. Add `p-limit` dependency. Default cap = 4 (env-tunable via `UPLOAD_BUILD_CONCURRENCY`).
- **In**: Preserve current error semantics — first failure cancels remaining work; resolved results return.
- **Out**: Any change to `CardGenerator.run`, `create_deck.py`, or the spawn protocol itself. Any change to job-level concurrency above the zip.
- **Out**: Notion-path concurrency (different code path; covered by the separate worker-pool spec).

**User story**: As a paying user uploading a 100-page Notion export, I want the deck back in seconds rather than tens of seconds, so I can start studying without waiting.

**Acceptance criteria**
- [ ] `getPackagesFromZip` runs deck-build spawns with at most 4 in flight.
- [ ] A synthetic 100-file zip completes in ≤ 6 s on the prod-like local fixture (down from ~21 s).
- [ ] Peak Python RSS during the test stays under 600 MB total (4 × ~150 MB envelope).
- [ ] Existing upload tests pass without modification.
- [ ] No change in produced-deck bytes for any in-repo fixture.

**Open questions**
- Hard-code cap = 4, or env-tunable via `UPLOAD_BUILD_CONCURRENCY`? (Default to env-tunable; ship at 4.)
- `p-limit` as a new dep, or a 20-line inline semaphore?

**Out of scope (next iteration)**: Batched Python invocation (separate spec, `batched-python-deck-build`). Notion-path concurrency (separate spec, `notion-conversion-worker-pool`).

### Technical pre-flight
- **Layers touched**: `src/usecases/uploads/getPackagesFromZip.ts` only.
- **Cross-language**: none.
- **Effort**: S — single-file refactor + new dep.
- **Security / testing**: existing upload tests at `src/usecases/uploads/*.test.ts` cover the happy path. Add one test that simulates 8 spawns and asserts no more than 4 are in flight at any moment.
- **Migration concerns**: none (no DB, no API surface).
