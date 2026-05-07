---
description: Review a contributor PR against repo conventions and goal alignment
argument-hint: <pr-url-or-number>
---

Use the `engineer` agent.

1. Fetch the PR at $ARGUMENTS — prefer `gh pr view <number> --json ...` and `gh pr diff <number>` over WebFetch.
2. Read the diff and the changed files in context.
3. Review against the checklist in `.claude/agents/engineer.md` "Reviewing PRs" section:
   - Does it solve a real user problem? Tied to an issue or the goal in CLAUDE.md?
   - Tests included and meaningful (TDD-friendly, only mocking external deps)?
   - Types clean? No `any`, no untyped exports?
   - Comments? RULES.md says no — flag and suggest renames.
   - Layering respected (`routes` → `controllers` → `usecases` → `services` → `data_layer`)?
   - Scope creep? Refactors mixed with features?
   - Performance concerns on hot paths (conversion, file upload)?
   - Security concerns on auth, upload, billing, user input? If yes, recommend `/security-review` before merge.
4. Output a single review comment with:
   - **Verdict**: approve / request-changes / comment-only
   - **Blocking issues** (if any) — bundled, with code suggestions
   - **Non-blocking nits** (if any) — bundled separately
   - **One sentence of encouragement** if it's a first-time contributor

Tone: welcoming, specific, fast. Don't sit on the review.
