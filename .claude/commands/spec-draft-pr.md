---
description: Turn a feature idea or GitHub issue into a one-page spec saved to Documentation/specs/ and opened as a draft PR
argument-hint: <feature description or GitHub issue URL/number>
---

You are orchestrating a parallel trio spec-writing session. The input is: $ARGUMENTS

## Step 1 — Gather context

If `$ARGUMENTS` looks like a GitHub issue URL or number, fetch it with `gh issue view <number>` before anything else.

Read enough of the codebase to orient each agent: skim `CLAUDE.md`, then grep for the key nouns in `$ARGUMENTS` across `src/` and `web/src/`.

## Step 2 — Spawn all three agents in parallel

Launch the following three agents **simultaneously** using the Agent tool (one message, three tool calls):

**pm** — write a one-page spec following the format in `.claude/agents/pm.md` section 4. Include:
- Outcome + goal alignment
- Problem statement with a specific user instance if one can be inferred
- Riskiest assumption + smallest test to disprove it
- Scope (in / out)
- User story + acceptance criteria
- Which leading indicator this moves and by how much
- Open questions for the engineer

**designer** — given the same input, walk the user flow step-by-step and produce:
- The user moment this change addresses
- One concrete design recommendation (layout, primary action, copy strings, empty/error states)
- Any copy strings the user will see, following the rules in `.claude/agents/designer.md`
- Verdict: changes needed to the pm's scope, or "no UI changes required"

**engineer** — given the same input, produce a technical pre-flight:
- Which layers are touched (`routes` / `controllers` / `usecases` / `services` / `data_layer` / `web`)
- Files likely in play (list them)
- Any cross-language coordination needed (TypeScript ↔ Python)
- Estimated effort: S / M / L and why
- Any security, testing, or migration concerns to address before work starts

## Step 3 — Synthesize

After all three agents return, produce a **Synthesis block** before writing the file:

```
### Trio synthesis
- PM: <one line summary>
- Designer: <one line summary>
- Engineer: <one line summary>
- Agreement: <what all three aligned on>
- Conflict: <any disagreement and how it was resolved>
- Resulting plan: <one sentence>
```

## Step 4 — Write the spec file

Derive a short slug from the feature name (e.g. `offline-mode`, `csv-export`). Write the final spec to:

```
Documentation/specs/<slug>.md
```

The file must use the pm format from `.claude/agents/pm.md` section 4, augmented with:
- A **Design notes** section from the designer output (omit if designer said "no UI changes required")
- A **Technical pre-flight** section from the engineer output
- The trio synthesis block at the top, right after the title

Keep it to one page. If the work is bigger, split into numbered files (`<slug>-1.md`, `<slug>-2.md`) and link them.

## Step 5 — Open a draft PR

1. Create a branch in the format `docs/spec-<slug>`:
   ```
   git checkout -b docs/spec-<slug>
   ```
2. Stage and commit the new spec file:
   ```
   git add Documentation/specs/<slug>.md
   git commit -m "docs: add spec for <feature name>"
   ```
3. Push and open a draft PR:
   ```
   git push -u origin docs/spec-<slug>
   gh pr create --draft --title "spec: <feature name>" --body "..."
   ```
   PR body must include: what the spec covers, a link to the spec file, and the trio synthesis block.

Return the PR URL at the end.
