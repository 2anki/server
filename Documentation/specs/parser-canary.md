# Parser canary — daily regression detection for Notion HTML exports

## Problem

Notion's HTML export format has drifted multiple times since 2020. Each time, the 2anki parser broke silently: users got wrong card counts, missing images, or empty decks. The most recent drift (Feb 2025) went unhandled for over a year. No alert fired. The cluster of "it worked for years, now it doesn't" complaints is the highest-leverage retention problem in the data.

## Goal

Detect parser regressions within 24 hours of a format drift, before users report them. A daily canary job runs reference fixtures through the live parser and compares output against pinned snapshots. Any divergence triggers an alert.

## Proposed approach

**Reference fixtures** (`src/lib/parser/__fixtures__/`)
Store 3–5 hand-curated Notion HTML exports covering the known drift surfaces: toggle structure, image extraction, cloze merge. Each fixture pairs with a JSON snapshot: card count, cloze count, image count, toggle nesting depth. Fixtures overlap with spec `notion-html-parser-regression` and are shared.

**Canary runner** (`src/usecases/canary/runParserCanary.ts`)
Reads each fixture from disk, runs it through the existing parser pipeline (no Notion API calls), compares output counts against the snapshot, and emits a structured diff for any divergence. Returns a typed result (`pass | fail[]`) so tests and the scheduler both consume it cleanly.

**Scheduler registration** (`src/lib/ankify/scheduler/`)
Add the canary to the existing cron registry at a low-traffic UTC hour (03:00). Daily cadence. No new scheduler infrastructure.

**Alerting**
On `fail[]`, send a plain-text summary to the maintainer address via `EmailService`. Include fixture name, expected counts, actual counts, and a diff. If `src/services/observability/` already pipes errors to Sentry, also log a structured error there so it appears in the Sentry issue stream alongside other job failures.

**Snapshot updates**
When the parser is intentionally changed and counts shift, run `npx tsx src/usecases/canary/updateSnapshots.ts` to regenerate. No hand-editing JSON.

## Files touched

| Path | Action |
|---|---|
| `src/lib/parser/__fixtures__/` | New fixtures (shared with `notion-html-parser-regression`) |
| `src/usecases/canary/runParserCanary.ts` | New — canary runner |
| `src/usecases/canary/runParserCanary.test.ts` | New — unit tests (fixture → snapshot assertion) |
| `src/usecases/canary/updateSnapshots.ts` | New — snapshot update script |
| `src/lib/ankify/scheduler/` | Register daily canary job |
| `src/server.ts` | Wire scheduler if not already hooked |

## Success criteria

- Any fixture whose card or image count diverges from its snapshot triggers an alert email within 24 hours.
- False positive rate < 1 per month after one month of tuning.
- Zero Notion API calls at runtime.
- CI passes: canary tests run in the standard Jest suite without network access.

## Out of scope

- Retroactive fix for current parser regressions — see spec `notion-html-parser-regression`.
- Public status page.
- Monitoring the Notion API surface (rate-limited, different failure mode).

## Open questions

**Should the canary cover image extraction and cloze merge, or only toggle/structure?**
Recommendation: cover all three. They share the same HTML drift surface, and image and cloze failures are the two largest complaint categories in the Reddit data. Adding them costs one more fixture and two more snapshot fields — the marginal work is small relative to the detection value.
