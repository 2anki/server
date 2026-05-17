# Spec: rewrite "could not create a deck" error and add upload-screen primer

## Problem

The most-quoted user complaint from the r/notion2anki archive (reviewed 2026-05-18) is this error string:

> "Could not create a deck using your file(s) and rules. Make sure to at least create on valid toggle or verify your settings?"

Four failures in one sentence: typo ("on" → "one"), trailing question mark on a statement, internal jargon ("rules"), and it blames the user for a settings page they never opened. In some failure modes the string is followed by `Invalid string length` leaked raw from V8 — a JavaScript engine internal surfacing as a user-visible error.

The root cause goes deeper than the copy. Nothing on the upload screen explains the toggle mental model. Users export a Notion page of headings and bullets, upload it, get 0 cards, and assume the product is broken. Reddit threads confirm they reach for Google or r/notion2anki instead of the next step.

## Goal

1. Replace the broken error string with one that names the file, explains what happened, and gives one concrete next action.
2. Add a primer above the dropzone so users know the toggle model *before* they upload — preventing the zero-card outcome rather than explaining it after.
3. Wrap the V8 `Invalid string length` leak so it never reaches the client.

## Proposed approach

### Upload-screen primer (above the dropzone)

```
Make cards from your Notion toggles

Each toggle becomes one card — the toggle title is the front, what's inside is the back.
Export your page from Notion as HTML and drop the .zip below.

[link] See a 30-second example
```

This sets expectations before the first upload. It does not require a logged-in state.

### Replacement error (when no toggles are found)

```
We didn't find any toggles in [filename.zip]

2anki turns Notion toggles into cards — the toggle title becomes the front,
what's inside becomes the back. Your file looks like plain text or bullets.

Try this:
• Open your page in Notion and convert a few headings to toggles (/toggle)
• Re-export as HTML and upload again

[See an example page]  [Email support]
```

`[filename.zip]` is the actual uploaded filename. The two CTAs link to an example Notion page and `mailto:support@2anki.net`.

Voice applied: names the file, explains the model before the failure, one concrete next step, no "valid"/"rules"/"verify your settings", no trailing question mark, sentence case.

### V8 leak fix

Locate the `JSON.stringify` call (or equivalent) that can produce a string large enough to trigger `Invalid string length`. Wrap it with a try/catch that maps to the same friendly error surface above. The raw V8 message must not reach the client.

Introduce an `EmptyDeckError` class (or equivalent named error) to distinguish "no toggles found" from generic conversion failure — so the controller can route to the new copy rather than the generic fallback.

## Files touched

- `web/src/pages/UploadPage/` (or whichever component renders the upload screen) — add the primer above the dropzone.
- `src/controllers/UploadController.ts` or `src/usecases/jobs/` — replace the error string, catch the V8 overflow, route `EmptyDeckError` to the new copy.
- `src/lib/` or `src/errors/` — add `EmptyDeckError`.
- `web/src/styles/` — minor styling for the primer block if needed (no new design system components required).
- `web/src/pages/WhatsNewPage/changelog.ts` — one changelog entry.

## Success criteria

- The string "Could not create a deck using your file(s) and rules" does not exist anywhere in the codebase.
- Uploading a Notion export that contains no toggles shows the new error with the actual filename.
- The string "Invalid string length" does not reach `res.json()` or `res.send()` in any code path.
- The primer is visible above the dropzone on the upload screen without a login.
- Unit test: `EmptyDeckError` is thrown when the parser returns 0 cards; controller maps it to the new copy.

## Out of scope

- Parser regression sweep (`notion-html-parser-regression` spec handles that).
- Broader onboarding overhaul or interactive walkthrough.
- Changing the toggle-as-card mental model — this spec assumes it stays the core model.

## Open questions

1. **Primer longevity.** The primer copy is tightly coupled to the toggle model. If the parser is extended to accept headings or bullets as card sources, the primer and error must be updated. Ship now — the current copy is actively damaging, and the parser extension is not on the near roadmap.
2. **V8 overflow source.** The `Invalid string length` likely originates from `JSON.stringify` on a large Notion export buffer. Needs a quick grep to confirm before the fix is written. If the source is in the Python bridge (`create_deck.py` stdout), the truncation goes in `CardGenerator.ts` instead.
3. **Example page link.** A "See a 30-second example" target does not exist yet. Options: link to the existing Notion template, a YouTube short, or a static page on 2anki.net. Decision needed before the primer ships.
