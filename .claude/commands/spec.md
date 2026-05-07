---
description: Turn a GitHub issue into a one-page implementation spec ready for the engineer agent
argument-hint: <github-issue-url>
---

Use the `pm` agent.

1. Fetch the issue at $ARGUMENTS — prefer `gh issue view <number>` over WebFetch when the GitHub CLI is available.
2. Read related code in the repo to understand current behavior. Use Grep liberally. Note which layer (`routes` / `controllers` / `usecases` / `services` / `data_layer`) the change lands in.
3. Write a spec using the format in `.claude/agents/pm.md` section 4.
4. End with a recommendation on whether the `designer` agent should review before engineering starts (yes if user-facing surface changes, no for pure backend/infra).

The spec must fit on one page. If the work is bigger, split into N specs and number them.
