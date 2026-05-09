---
description: Hypothesis-driven debugging when a fix has failed twice
argument-hint: <symptom or failing test name>
allowed-tools: Read, Grep, Bash
---

Use this when guessing has stopped working. The symptom or failing case is:

$ARGUMENTS

Run a structured loop, not a vibes session.

1. **Restate the symptom precisely.** What is observed vs. what is expected? Where (which test, which endpoint, which env)? When did it start (`git log` on the touched files)?
2. **Reproduce.** Find the smallest command that demonstrates the bug — usually a single `pnpm test <file> -t '<name>'`. If you can't reproduce locally, that *is* the first hypothesis.
3. **Form 3 hypotheses, ranked.** Each hypothesis must be falsifiable by a specific observation:
   - H1: <statement>. Falsifier: <log/grep/test that would disprove it>.
   - H2: ...
   - H3: ...
   Always include a "the test is wrong" hypothesis — sometimes it is.
4. **Test the cheapest hypothesis first.** Read the relevant code, grep for callers, inspect logs, add a temporary `console.log` if needed (strip before commit). Record what you observed against the falsifier.
5. **Update the ranking.** If H1 was eliminated, promote the next; if a new hypothesis emerged, add it. Do not skip back to "let me just try changing X" without writing it down as Hn first.
6. **Stop conditions.**
   - Found: state the root cause in one sentence, then write a failing test that captures it (skill `/tdd`), then fix.
   - Stuck after 5 hypotheses: stop guessing. Bisect with `git bisect` or ask for help — a 6th vibes-attempt is not better than the 5th.

Report at the end: the root cause, the test that now pins it, and the one-line fix. If the root cause turned out to be in a layer above (e.g. a wrong test, a stale fixture, a misread CLAUDE.md rule), say so explicitly — those are the most useful debugs to remember.
