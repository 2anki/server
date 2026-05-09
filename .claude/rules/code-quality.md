# Code-quality rules

Patterns the SonarCloud quality gate, the project RULES.md, and review history have surfaced repeatedly.

| Requirement | Do instead | CWE |
| --- | --- | --- |
| Do not add comments to explain WHAT code does. | Rename the variable/function/file so the next reader doesn't need the comment. Comments are stripped before review. | — |
| Do not write `if (!ready) { … } else { … }`. | Lead with the positive: `if (ready) { … } else { … }` (Sonar S7735). Negation + else forces mental inversion. | — |
| Do not deduplicate code on the second occurrence. | Wait for the third. Premature abstraction is harder to undo than three honest copies. | — |
| Do not introduce `any`, `as any`, or `@ts-ignore` without a one-line justification on the same line. | Reach for a real type; if it is genuinely unknown, use `unknown` and narrow at the boundary. | CWE-704 |
| Do not edit anything under `src/data_layer/public/`. | Run `pnpm kanel` after migrations — those files regenerate. | — |
| Do not leave `console.log`, `debugger`, or `xdescribe` in committed code. | Strip before pushing. The Stop hook nudges; review will block. | CWE-489 |
| Do not skip layers (controller → repository, route → service). | Route → controller → use case → service → data layer. Each layer's CLAUDE.md says what belongs there. | — |
| Do not put business logic in routes or controllers. | Controllers shape HTTP; use cases orchestrate; services hold reusable domain logic. | — |
| Do not import `knex` outside `src/data_layer/`. | Take a repository interface in the constructor; tests inject a fake. | — |
| Do not use chained nested ternaries. | Extract to a function with named branches; Biome's `noNestedTernary` will fail the web lint anyway. | — |
| Do not add a flag-on-flag option to a function (`opts.x`, `opts.skipX`, `opts.forceX`). | Two functions, or two call sites. Boolean parameter explosion is a code smell. | — |
| Do not catch an error only to rethrow the same error. | Drop the try/catch; let it propagate to `ErrorHandler`. | CWE-755 |
| Do not stack PRs (feature B branched off feature A's branch). | One PR per feature off `main`. The deploy pipeline ships a single branch. | — |
| Do not introduce backwards-compat shims, `_unused` renames, or "removed because…" comments for deleted code. | If the symbol is unused, delete it. The git history is the changelog. | — |
| Do not commit changes that fail `/check`. | Run server tsc + web typecheck + web vitest + web lint locally first. | — |
| Do not put `setInterval`/`setTimeout` for sync jobs at module top-level. | Schedule explicitly in `server.ts` startup or via a documented job runner. Stripe sync is **manual only**. | — |
