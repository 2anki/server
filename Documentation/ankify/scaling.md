# Ankify scaling — capacity, ceilings, and scale-out path

Honest read of how far the per-customer-container architecture takes us, what the binding constraints are, and what to change before each ceiling bites. Sized against the prod Hetzner box (8 × i7-4770 @ 3.4 GHz, 31 GiB RAM, 203 GB disk).

> The non-Ankify product (one-shot `.apkg` conversion) shares zero resources with Ankify and scales independently — it's pure in-process Node. This doc is only about Ankify.

## Architecture today

Each Ankify customer gets a dedicated Docker container running `remote-anki-client:latest` (real Anki + Xvfb + noVNC). One container per active customer, provisioned on demand by `RacService.provision`, removed by the reaper after 30 min idle.

**Per-container caps** (`src/services/ankify/RacService.ts:15-30`):

| Resource | Cap | Notes |
|---|---|---|
| Memory | **1.5 GiB** | cgroup-enforced; kernel kills the container if exceeded |
| CPU | **0.5 cores** | `CpuQuota=50000 / CpuPeriod=100000` |
| Anki port | one of `20000-21000` | 1001-slot range |
| noVNC port | one of `22000-23000` | 1001-slot range |
| Lifetime | until 30 min idle | reaped by `scheduleAnkifyReaper` |
| Capabilities | `CapDrop: ALL`, `no-new-privileges` | hardened |

**Background loops** (`src/lib/ankify/jobs/`):
- Polling: every **5 min**, sync each enabled Notion subscription via `SyncNotionPageToRacUseCase`. Notion's free-tier rate limit is 3 req/sec/integration — the cadence is sized against that.
- Reaper: every **5 min**, stop + remove containers idle for ≥ 30 min.

## Live measurement on prod (2026-05-10)

One paying customer container running for 34 h:

```
NAME              CPU %   MEM USAGE / LIMIT   MEM %
pedantic_lalande  1.26%   408 MiB / 1.5 GiB   27 %
```

PSS for the full sandbox group (anki + Xvfb + 5 QtWebEngine zygotes), via `smem`:

| Metric | Value |
|---|---|
| USS (unique pages) | 712 MiB |
| **PSS (fair share, marginal cost)** | **906 MiB** |
| RSS (inflated, double-counts shared) | 1.3 GiB |

A *cold* second sandbox should cost closer to **~700 MiB PSS** because Qt/Python libraries page in once and are shared across containers. The 1.5 GiB cap is the worst-case kernel-enforced ceiling, not the typical footprint.

## Real ceilings on this box

Available headroom after reserving 6 GiB for Node + Postgres + OS + deploy churn = **23 GiB** for containers; 6 cores left for containers after reserving 2 for the rest of the system.

| Constraint | Worst case (cap-bound) | Realistic (idle ~700 MiB) |
|---|---|---|
| **Memory** | 23 GiB ÷ 1.5 GiB = **15 containers** | 23 GiB ÷ 0.7 GiB ≈ **~33 containers** |
| **CPU** | 6 cores ÷ 0.5 = **12 actively rendering** | dozens idle |
| **Port range** | **1000** containers (architectural) | 1000 |
| **Disk** | image is shared (3.3 GB); per-customer `/data` volume grows with the user's collection | 119 GB free today |
| **Notion API** | 3 req/sec/integration | per-user subscriptions stagger over the 5 min poll |

**Binding constraint = memory**, with CPU as the next ceiling. Realistic capacity for *concurrently active* Ankify customers on this box: **~25–30 before tail latency degrades, ~15 hard ceiling under worst-case usage.** The reaper means provisioned-but-idle containers free up automatically every 30 min, so DAU > concurrent active.

## The 300 K user goal vs. this architecture

If 1 % of 300 K were concurrently active → 3 000 containers × 1.5 GiB = **4.5 TB of RAM**. This box maxes at ~30 simultaneous active. Per-customer-container is single-box, low-thousand-DAU architecture by design — fine for early validation, structurally wrong for the scale goal.

## Scale-up plan

Cheap knobs first (single-line code changes), structural changes later.

### Phase 0 — Observability (do now)

We currently can't see when we're approaching the ceiling. Before any tuning:

- Log container count + total Ankify memory PSS to the server's existing observability path each minute.
- Surface `docker ps --filter ancestor=remote-anki-client:latest | wc -l` and PSS-sum on a small admin dashboard or `/api/admin/ankify/health`.
- Alert when container count > 10 or total Ankify PSS > 15 GiB.

### Phase 1 — Right-size the per-container caps

Cheap, single-PR. The live container peaks at 408 MiB out of 1.5 GiB; we're paying for headroom we don't use.

| Knob | Today | Suggested | Effect |
|---|---|---|---|
| `CONTAINER_MEMORY_BYTES` | 1.5 GiB | **1 GiB** | worst-case ceiling: 15 → 23 containers |
| `CONTAINER_CPU_QUOTA` | 50000 (0.5 core) | unchanged | rendering bursts use it |
| `ANKIFY_IDLE_THRESHOLD_MS` | 30 min | **10 min** | faster reap, more provision churn |
| `ANKIFY_REAP_INTERVAL_MS` | 5 min | **2 min** | catches idle containers sooner |

Validate by watching cgroup OOM-kills on prod for a week. If any container hits the cap, back off.

### Phase 2 — Replace polling with Notion webhooks

Polling forces a container spin-up every 5 min for every enabled subscription. Webhooks let containers stay reaped until there's actual work. The deferred design is in [notion-webhooks-deferred.md](./notion-webhooks-deferred.md); the receiver in `routes/AnkifyWebhookRouter.ts` is intentionally inactive today.

Estimated effect: **~5–10× capacity headroom** for the same hardware, because most Notion pages don't change every 5 min.

### Phase 3 — Pooled workers (one-time architectural change)

The hardest but highest-leverage change. Replace per-customer container with a **pool of N worker containers**, each multiplexing M customers' AnkiConnect calls over a queue keyed by collection-id. The AnkiConnect API key is already per-container (slice 2) — the same shape works per-job.

Sketch:
- `AnkifyWorkerPool` of, say, 8 containers.
- A job queue (Postgres `LISTEN/NOTIFY` or Redis Streams) takes `(owner, notion_page_id, change)` events.
- A worker picks a job, mounts the customer's collection volume, runs the AnkiConnect ops, releases.
- Customer collections still on per-owner volumes; pool only holds the runtime, not the data.
- Browser-facing noVNC sessions stay per-customer (different surface, much lower DAU than sync) — only the *sync* path gets pooled.

Estimated capacity per box: **~500–1000 customer DAU** instead of ~30 concurrent.

### Phase 4 — Multi-box (when one box isn't enough)

Sticky-by-owner routing: hash `owner` to one of N application boxes; each box owns a slice of customers. Postgres stays central; container fleet shards. The ankify session URL already includes `novnc_port`, so a router stage on Apache is the only new component.

This is straightforward once Phase 3 is in place — pooled workers shard cleanly. Without Phase 3, you'd be sharding a per-customer-container deployment, which is workable but wasteful.

## Decision log

- **Why per-customer container today.** Isolation simplicity for the first paying customer; Anki collections are stateful and the per-customer volume is the cleanest mental model. The ceiling is a known cost.
- **Why not raise port range now.** Port range is 1000 wide; we'd hit memory at ~30, CPU at ~12 — port range isn't binding for the foreseeable future.
- **Why not push Stripe-tier-based capacity gating.** The reaper already gates idle resource use; gating provisioning by tier is a UX problem, not a capacity problem until DAU > ~50.

## Triggers — when to do each phase

| Signal | Phase to start |
|---|---|
| First production OOM-kill on a container | Phase 1 |
| Concurrent active Ankify containers > 8 sustained | Phase 1 + start Phase 2 |
| Polling cycle takes longer than the interval | Phase 2 |
| DAU > 50 with sustained 20+ concurrent containers | Phase 3 |
| Any single box CPU sustained > 60 % from Ankify | Phase 4 |

## See also

- [README.md](./README.md) — current state of the Ankify product in 2anki/server.
- [security-hardening.md](./security-hardening.md) — per-slice status of the security work; some hardening also constrains capacity (memory cap is from slice work).
- [notion-webhooks-deferred.md](./notion-webhooks-deferred.md) — the Phase 2 design.
- `src/services/ankify/RacService.ts` — container provisioning, the source of every number above.
- `src/lib/ankify/jobs/scheduleAnkifyPolling.ts`, `scheduleAnkifyReaper.ts` — cadences.
