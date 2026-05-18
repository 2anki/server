## Spec: Move Notion conversion off the main event loop

### Trio synthesis
- **PM**: Notion conversion today runs fire-and-forget on the main Express event loop — every conversion contends with every HTTP request including healthchecks, login, and pricing-page traffic. Under concurrent users this is a tail-latency hazard and a request-handling correctness risk. Precondition for scaling past current concurrency.
- **Designer**: No UI changes required. The user experiences a more responsive site while other users' conversions are in flight — same screens, same flows.
- **Engineer**: Touches `src/controllers/NotionController.ts:convert`, the `performConversion` chain, and the post-spawn `readFileSync` sites. Introduce a shared worker pool (`piscina` likely) wired into `src/server.ts` startup, reusable by both upload and Notion paths. L effort because the job-status sequencing must remain exact and the pool must be co-budgeted with the bounded-parallel spawn cap. Pair with a *warm* pool so the upload path stops paying 300 ms per-request Worker spawn (current cost).
- **Agreement**: introduce a shared, warmed worker pool used by both upload and Notion paths. Co-budget pool size with the bounded-spawn cap from the parallel-deck-build spec.
- **Conflict**: scope-creep risk — could attempt a full job queue (Redis / BullMQ). Resolved by holding scope to "off the main loop, on existing primitives." A real queue is a separate, later decision.
- **Resulting plan**: small `piscina`-based pool; route `performConversion` into it; ensure post-spawn file reads and S3 uploads run inside the worker; preserve job-status state machine exactly.

**Outcome**: A long Notion conversion no longer blocks healthchecks or other HTTP traffic on the same Node process. Healthcheck p99 stays below 100 ms while 10 concurrent Notion conversions run (today it spikes to seconds).

**Goal alignment**: Concurrency safety is a precondition for the 300 K-user growth target. Without it, every additional concurrent user makes p99 latency on unrelated routes worse.

**Problem**: `NotionController.convert` invokes `performConversion(...).catch(...)` on the main event loop. Inside that promise chain: Python `spawn` (async but contention on libuv), `readFileSync(apkgPath)` (synchronous, blocks the loop), and an S3 upload (network I/O, OK but still loop-bound). The upload path already uses a `worker_threads.Worker` *per request* (300 ms cold spawn per upload), but the Notion path doesn't use workers at all — it just yields to other event-loop tasks between awaits.

**Riskiest assumption**: That moving `performConversion` into a worker thread and using a warm pool preserves all the existing failure-recovery + job-status-update semantics — i.e. that `JobRepository.updateJobStatus`, `incrementCardUsage`, and the `eventsQuery.countByNameForUser` writes still happen in the right order with the right error surfaces.

**Smallest test**: Run a Notion conversion in the new worker path locally and trace the exact sequence of `JobRepository` writes against the current main-loop sequence. If they match, the move is safe. (No production data; local Postgres with a test user.)

**Scope**
- **In**: Add a small worker-pool primitive (likely `piscina`) wired into `src/server.ts` startup. Both upload (`GeneratePackagesUseCase`) and Notion (`NotionController.convert`) paths route through it.
- **In**: Replace `readFileSync(apkgPath)` with `fs.promises.readFile` in `BuildDeckForJobUseCase` and `WorkSpace.getFirstAPKG`.
- **In**: Pool size sourced from a single `CONVERSION_WORKERS` env var (default 4), co-budgeted with the bounded-spawn cap from the parallel-deck-build spec (concurrent Python spawns ≤ pool size).
- **Out**: A full job queue (Redis / BullMQ). Migrating Notion polling to webhooks (separately deferred per `Documentation/ankify/notion-webhooks-deferred.md`).
- **Out**: Any change to the job-status state machine itself — just moving where the writes happen.

**User story**: As any user of 2anki, I want the site to feel responsive while large Notion conversions are running for other users, so login, pricing, and the conversion flow aren't all sharing one event loop.

**Acceptance criteria**
- [ ] `performConversion` runs in a worker thread, not on the main loop.
- [ ] `readFileSync` calls on the conversion post-build path are replaced with `fs.promises.readFile`.
- [ ] Load test — 10 concurrent Notion conversions on a local dev box keep healthcheck p99 under 100 ms throughout (verified against current main, where it spikes to seconds).
- [ ] Job status / card-usage writes happen in the same order as today (verified via integration trace).
- [ ] No change to API surface or DB schema.

**Open questions**
- `piscina` as a new dep, or hand-roll a 50-line worker pool? (Piscina handles abort + crash + restart; hand-rolled wouldn't.)
- Migrate the upload path's existing per-request `Worker` into the pool in this PR, or as a follow-up? (Same shape; question is scope.)

**Out of scope (next iteration)**: Redis-backed queue, multi-server distribution, distributed worker pool. Webhook-based Notion sync.

### Technical pre-flight
- **Layers touched**: `src/server.ts`, `src/controllers/NotionController.ts`, `src/usecases/jobs/performConversion.ts`, `src/usecases/jobs/BuildDeckForJobUseCase.ts`, `src/usecases/uploads/GeneratePackagesUseCase.ts`, `src/lib/parser/exporters/CustomExporter.ts`, `src/services/storage/WorkSpace.ts`.
- **Cross-language**: none directly (Python still per-spawn; the change is purely Node-side).
- **Effort**: L — touches multiple use cases and the server-startup boot order. Job-status sequencing must remain exact.
- **Security / testing**: existing job-flow tests cover the contract. Add a load test simulating concurrent conversions; verify event-loop block time via `--inspect` or a `loop-stats` library.
- **Migration concerns**: server startup must initialize the pool before any controller handles a request. Job-status terminal-guard already exists (see `feedback_job_terminal_status_guard`); ensure worker-side failures still surface to the queue rather than being silently swallowed.
