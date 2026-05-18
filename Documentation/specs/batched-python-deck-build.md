## Spec: Batched Python invocation for deck building

### Trio synthesis
- **PM**: The Python interpreter cold-start (~141 ms) plus `genanki`/`ftfy` import chain is the irreducible floor of every `.apkg` build today. Killing this per-file overhead for multi-deck uploads is the largest single-conversion latency win in the audit.
- **Designer**: No UI changes required.
- **Engineer**: Cross-language change — extend `create_deck.py` to accept a manifest of N `deck_info.json` paths and produce N `.apkg` files in one process. TypeScript side: collect all decks for a zip, invoke once. M effort. The trap: module-level state (`media_files`, `decks`, `notes`) leaking between decks — must explicitly reset between deck builds and surface partial failures to the queue.
- **Agreement**: per-spawn correctness isolation must be preserved *between decks within the same process* (explicit state-reset between iterations, partial-failure surface).
- **Conflict**: persistent long-running Python worker (originally proposed in the audit) was rejected by cross-review on correctness grounds — state leakage would silently corrupt media manifests. Batched single-shot invocation is the safe shape.
- **Resulting plan**: extend `create_deck.py` to accept a JSON manifest of inputs; ship `CardGenerator` to invoke once per upload rather than once per file; reset state between decks; fail the whole batch if any deck fails (preserves current all-or-nothing behavior).

**Outcome**: Cut a 100-page Notion export wall-clock by an additional ~14 s on top of the bounded-parallel win — Python cold-start drops from 141 ms × N to 141 ms × ⌈N / parallel-cap⌉.

**Goal alignment**: Compounds with the bounded-parallel spec to make multi-page Notion conversion feel near-instant. Directly moves the "first-deck-in-session" leading indicator.

**Problem**: `CardGenerator.run` spawns `python3 create_deck.py` once per `deck_info.json`, and each spawn pays a ~141 ms Python startup + `genanki`/`ftfy` import tax before any deck work runs. A 100-page Notion export pays this 100 times — ~14 s of pure interpreter overhead before any deck content is built.

**Riskiest assumption**: That `create_deck.py` can build N decks within one process without subtle cross-deck contamination — specifically, that resetting `media_files`, `decks`, and `notes` between deck builds (plus any other module-level state) produces byte-identical `.apkg` files to the current per-spawn run.

**Smallest test**: Pick 3 in-repo fixtures (`Some Cloze Deletions.html`, `Nested Toggles.html`, `notion-new-export-nested.html`). Build them today (3 separate `CardGenerator.run` calls). Build them again with a prototype batch invocation. Compare `unzip -p deck.apkg collection.anki21 | sqlite3 -cmd '.dump'` byte-for-byte. If they match, the assumption holds.

**Scope**
- **In**: Add `--batch <manifest.json>` mode to `create_deck/create_deck.py` that reads a JSON array of `{ input, output }` entries and builds each into its own `.apkg`. Explicit state-reset between iterations.
- **In**: Add a `runBatch(decks)` API on `src/lib/anki/CardGenerator.ts` (or a thin wrapper) used by `getPackagesFromZip`.
- **In**: Failure semantics — first deck failure aborts the batch and surfaces the failing input path. Caller treats this as a whole-upload failure (current behavior).
- **Out**: Long-running persistent Python worker. Any change to genanki internals or the `.apkg` SQLite schema.
- **Out**: Single-file upload path (still pays one cold-start per upload; not worth the batched complexity at N = 1).

**User story**: As a user uploading a multi-page Notion zip, I want conversion to feel instant for typical exports so I don't context-switch away.

**Acceptance criteria**
- [ ] `python3 create_deck.py --batch manifest.json` builds N decks correctly.
- [ ] Module-level state is reset between deck builds (verified by a `pytest` that builds two decks with distinct media and asserts no cross-pollination).
- [ ] Byte-for-byte equivalence: `.apkg` files produced via batch mode match per-spawn outputs for the 3 in-repo fixtures.
- [ ] 100-fixture-zip wall-clock improves by ≥ 10 s relative to current main on a prod-like local machine.

**Open questions**
- How does this compose with the bounded-parallel spec? Most likely: each `pLimit` slot dispatches one batched invocation, so a 100-file zip with cap = 4 runs 4 parallel batches of ~25 decks each.
- Partial-batch failure surface — "first 47 decks succeeded, deck 48 failed" or "whole upload failed"? Default to current behavior (whole upload fails).

**Out of scope (next iteration)**: Streaming output (Python could emit per-deck completion events for a granular progress bar).

### Technical pre-flight
- **Layers touched**: `create_deck/create_deck.py`, `create_deck/helpers/`, `src/lib/anki/CardGenerator.ts`, `src/usecases/uploads/getPackagesFromZip.ts`.
- **Cross-language**: yes — TypeScript ↔ Python protocol change. Define the manifest JSON shape in both repos' docs.
- **Effort**: M — moderate Python refactor + TypeScript caller change + careful state-reset.
- **Security / testing**: add a `pytest` covering two-deck batches with distinct media. Add a Jest test that runs both modes on a fixture and diffs SQLite dump output (schema-level diff is sufficient; no need to byte-diff ZIP central directory).
- **Migration concerns**: none on data side. Old single-deck mode must remain functional for the Notion conversion path that doesn't batch.
