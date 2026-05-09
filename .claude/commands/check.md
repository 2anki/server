---
description: Parallel server tsc + web typecheck + web vitest + web lint
allowed-tools: Bash
---

Run all four checks in parallel via a single Bash call:

```bash
pnpm --filter notion2anki-server build & \
pnpm --filter 2anki-web typecheck & \
pnpm --filter 2anki-web test:run & \
pnpm --filter 2anki-web lint & \
wait
```

If any fails, print one line per failure with the file:line and the error message — nothing else. If all pass, say "all clean" and stop.

The web `lint` step runs Biome with the rules that mirror SonarCloud findings (`useOptionalChain`, `noNestedTernary`, `noNegationElse`, `noUselessTernary`). Catching them locally avoids a CI round-trip after Sonar comments on a PR.
