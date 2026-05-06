---
description: Parallel server tsc + web typecheck + web vitest
allowed-tools: Bash
---

Run all three checks in parallel via a single Bash call:

```bash
pnpm --filter notion2anki-server build & \
pnpm --filter 2anki-web typecheck & \
pnpm --filter 2anki-web test:run & \
wait
```

If any fails, print one line per failure with the file:line and the error message — nothing else. If all pass, say "all clean" and stop.
