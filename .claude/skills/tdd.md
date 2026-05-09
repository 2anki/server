---
description: Red-green-refactor cycle for a new function or behaviour change
argument-hint: <file path or short description of the behaviour>
allowed-tools: Read, Edit, Write, Bash
---

Drive a single red-green-refactor cycle, no shortcuts. The behaviour to add or change is:

$ARGUMENTS

Steps, in order. Do not skip.

1. **Locate the target.** If a path was given, read it and the colocated test file. If only a description was given, grep to find the right file/function. Read any FEATURE.md and the layer's CLAUDE.md before designing the test.
2. **Write a failing test.** Add an `it(...)` (or `it.each([...])`) to the existing colocated `*.test.ts`, or create one if it doesn't exist. The assertion must describe the intended behaviour, not the current behaviour.
3. **Run it and confirm it fails for the right reason.** `pnpm test <file>`. If the failure message would not help a future reader diagnose the bug, rewrite it.
4. **Make it pass with the smallest viable change.** No drive-by refactors. No new abstractions on the second occurrence — wait for the third (per `.claude/rules/code-quality.md`).
5. **Run the file again — green.** Then run the broader suite if the change might ripple: `pnpm test <dir>`.
6. **Refactor only now.** Rename for clarity, extract a helper if duplication has now appeared three times, drop scaffolding. Tests stay green at every step.
7. **Strip debug code.** No `console.log`, no commented-out experiments, no `xit`/`xdescribe`.
8. **Report back briefly:** which test file changed, which source file changed, the one-line "why" for the change.

If the test would require mocking an internal service to be fast/clean, stop and reconsider — internal services are not mocked (`.claude/rules/testing.md`). Mock only the external edge.
