---
description: Show current PR's check status; pull failure logs if any are red
allowed-tools: Bash
---

Get the rollup for the current branch's PR:

```bash
gh pr view --json statusCheckRollup -q '.statusCheckRollup[] | "\(.conclusion // "pending")\t\(.name)\t\(.workflowName // "")\t\(.detailsUrl // "")"'
```

Summarize: counts of pass / fail / pending. If anything failed, fetch the relevant run's failure log via `gh run view <id> --log-failed | tail -40` and quote the actual error in 2-3 lines. Don't speculate — show the literal failure message.

If everything is green or pending, just say so.
