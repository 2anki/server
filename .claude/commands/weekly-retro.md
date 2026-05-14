---
description: Weekly retro - pull metrics, compare to goal trajectory, recommend one priority shift
argument-hint: paste this week's numbers, or leave empty to ask for them
---

Use the `pm` agent.

1. Pull this week's traffic and engagement data using the `analytics-mcp` tools (GA4 property `properties/286902985`). Run these reports before asking the user for anything:
   - Sessions + active users + new users by date (last 7 days vs prior 7 days).
   - **Traffic Sources**: sessions, new users, and engagement rate by `sessionDefaultChannelGroup` + `sessionSource` — flag any channel that is up or down >20% week-over-week.
   - Top events by event count.
   - New vs returning users with avg session duration and engagement rate.

   Then ask the user to supply: churn signal and top 3 support themes (if not already pasted).

2. Compute:
   - Week-over-week change for each metric (sessions, new users, engagement rate, paid conversions).
   - Required weekly growth rate to reach the 300K-user goal in 24 / 18 / 12 months.
   - Gap between actual and required.
   - **Traffic Sources table**: which channels grew, which shrank, which drove engaged users vs bounce-and-leave.

3. Identify the **single biggest gap** this week. Not three. One.

4. Tie it to the goal in `CLAUDE.md` — does the gap come from making the product simpler/faster/more beautiful, or from scale? Be specific.

5. Recommend **one** priority shift for the next 7 days. Either:
   - Spec X this week (and which spec).
   - Ship Y (and which spec is ready).
   - Pause Z to focus on the gap.

6. Output is two screens max. Numbers in a table. Traffic Sources section required. Recommendation in one paragraph.

Do not list five things. The point of the retro is to force a single decision.
