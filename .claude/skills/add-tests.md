---
description: Scaffold colocated unit tests for an existing source file
argument-hint: <path/to/source.ts>
allowed-tools: Read, Write, Bash
model: sonnet
---

Add or fill out the colocated `*.test.ts` for:

$ARGUMENTS

Process:

1. Read the source file completely and the layer's CLAUDE.md (controllers / usecases / services / data_layer / routes). Note constructor dependencies — these are the seams to inject test doubles at.
2. List the public exports and, for each, the contracts worth pinning (happy path, the obvious edge, any branch the type system can't prove).
3. Open the existing `*.test.ts` next to the source, or create one. Match the file's style — `describe`/`it`, `it.each` for parameterised cases.
4. Test names: state the behaviour, not the implementation. "rejects when token is missing" beats "calls validateToken".
5. **Mock only the external edge** (HTTP via `axios`/`instrumentedAxios`, third-party SDKs, email, AWS, fs when slow). Internal services run for real — pass real instances or in-memory fakes constructed in the test (`.claude/rules/testing.md`).
6. **Assert on shape, not truthiness.** Use `toEqual` / `toMatchObject` / `toBe(0)` instead of `toBeTruthy`. Exact error class, not the literal message text from third-party libs.
7. Run `pnpm test <new test file>`. Every new test must pass; if one fails, the source has a bug or the test does — diagnose before "fixing it" by softening the assertion.
8. Report: which exports are now covered, what was deliberately left out and why.

Do not edit the source file. If a public export is genuinely untestable as written, surface that as a follow-up — don't reach for `as any` or stub internals.
