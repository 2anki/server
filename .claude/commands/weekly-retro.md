---
description: Weekly retro - pull metrics, compare to goal trajectory, recommend one priority shift
argument-hint: paste this week's numbers, or leave empty to ask for them
---

Use the `pm` agent.

1. Get this week's numbers (signups, churn, conversion-success rate, top 3 support themes). If the user hasn't pasted them, ask for them in one structured block.

2. Compute:
   - Week-over-week change for each metric.
   - Required weekly growth rate to reach the 300K-user goal in 24 / 18 / 12 months.
   - Gap between actual and required.

3. Identify the **single biggest gap** this week. Not three. One.

4. Tie it to the goal in `CLAUDE.md` — does the gap come from making the product simpler/faster/more beautiful, or from scale? Be specific.

5. Recommend **one** priority shift for the next 7 days. Either:
   - Spec X this week (and which spec).
   - Ship Y (and which spec is ready).
   - Pause Z to focus on the gap.

6. Output is two screens max. Numbers in a table. Recommendation in one paragraph.

Do not list five things. The point of the retro is to force a single decision.
