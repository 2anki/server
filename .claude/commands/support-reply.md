---
description: Draft a reply to a support email - Alexander reviews and sends
argument-hint: paste the user email
---

Use the `pm` agent (with engineer if technical diagnosis is needed).

1. Read the user email below the `---` line.
2. If the issue requires technical investigation (conversion error, billing edge case, account state), use Grep to find the relevant code path before drafting.
3. Draft a reply that:
   - Opens with acknowledgement (one sentence, not effusive).
   - Answers the question directly. If we know the answer, give it. If not, say what we'll do next and when.
   - If it's a bug, file a draft GitHub issue inline (don't send to user, but include in your output).
   - Closes warmly but briefly.
4. Tone: Alexander's voice — concise, direct, no corporate apology language. Sign as "Alexander" (he sends).
5. Flag if this email reveals a recurring theme worth feeding into `/triage-feedback` later.

Output:
- **Draft reply** (ready to copy-paste-send)
- **Internal note** (anything Alexander should know but not say to the user)
- **Issue draft** (if applicable)

---

$ARGUMENTS
