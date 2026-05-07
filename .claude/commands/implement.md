---
description: Take a spec and ship it - branch, code, tests, PR
argument-hint: paste the spec or path to spec file
---

Use the `engineer` agent.

1. Read the spec below the `---` line (or the file path if provided).
2. Follow the engineer workflow in `.claude/agents/engineer.md`:
   - Restate the change in one sentence.
   - Trace the code path (list files, name the layer).
   - Plan the diff.
   - Write the failing test first (TDD per CLAUDE.md).
   - Implement (smallest viable change, no comments — meaningful names instead).
3. Suggest a branch name to me before creating it. Format: `<type>/<short-slug>` using a conventional commit prefix (`fix/`, `feat/`, `chore/`, `refactor/`, `test/`, `docs/`).
4. Once I confirm, create the branch, commit in logical chunks with conventional-commit messages, and push.
5. Run `/check` (parallel tsc + web typecheck + web vitest). All green before opening the PR.
6. Open the PR with `gh pr create` using the template in the engineer agent file.

Before merging:
- All checks green.
- If user-facing, ping the `designer` agent for a review pass.
- If the change touches auth, payments, or external-API integration, run `/security-review` first.
- Note goal alignment in the PR body (per `CLAUDE.md`).

---

$ARGUMENTS
