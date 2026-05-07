---
description: Synthesize raw user feedback (email, Discord, survey responses) into themes and draft GitHub issues
argument-hint: paste the raw feedback after the command
---

Use the `pm` agent to process the feedback I'll paste below.

Steps:

1. Read the feedback below the `---` line.
2. Synthesize using the feedback workflow in `.claude/agents/pm.md`.
3. For each theme rated High urgency, draft a GitHub issue:

   ```
   ## Issue: [Title]
   **Labels**: [bug / feature / ux / etc.]
   **Goal alignment**: one sentence connecting this to the goal in CLAUDE.md.

   ### Problem
   [synthesized from feedback]

   ### User signal (verbatim quotes)
   - "..."
   - "..."

   ### Proposed direction
   [one-paragraph recommendation, not a full spec]
   ```

4. End with a one-line summary: "X themes, Y high-urgency, suggest filing Z issues."

Do not file the issues yet — output drafts so I can review and post them.

---

$ARGUMENTS
