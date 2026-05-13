---
description: Force a trio review of the task that follows — pm, designer, and engineer weigh in in parallel before any action is taken
argument-hint: describe the task or paste the spec
---

Invoke `pm`, `designer`, and `engineer` subagents via the Agent tool **in parallel** against the task below. Each must produce their own analysis. Then synthesize:

1. What each agent said (one line each)
2. Where they agree
3. Where they conflict — state the conflict precisely and resolve it (or surface it for Alexander to call)
4. The resulting plan

Do not start any implementation until the synthesis is complete and explicit.

Conflicts are first-class output, not failure modes. If the designer wants more whitespace and the engineer says that pushes a key control below the fold on mobile, that is a real product decision — surface it, don't paper over it.

---

Task: $ARGUMENTS
