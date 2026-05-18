# Authoring MCQ cards in Notion

2anki detects multiple-choice questions directly from your Notion export — no plugins, no extra steps. Structure a toggle correctly and you get an interactive MCQ card in Anki instead of a basic front/back card.

## What a valid MCQ looks like

A toggle whose **title is the question stem** and whose **children are the answer options**. One option is marked as correct using either of two methods.

---

## Method 1 — Notion to-do blocks (recommended)

Use `/to-do` inside the toggle to create checkbox items. Check exactly one of them — that becomes the correct answer.

**Notion structure:**
```
▶ A 65-year-old man presents with crushing chest pain radiating to the jaw.
    ☑  Acute MI
    ☐  Stable angina
    ☐  GERD
    ☐  Aortic dissection
```

**What you get in Anki:**

- Front: the question stem with four labelled options (A–D)
- Back: the same layout with option A highlighted green and a checkmark

---

## Method 2 — Bulleted list with one option fully bolded

Use `/bulleted list` inside the toggle. Make the correct option's full text bold (select all the text, press Cmd/Ctrl+B). Works well for content pasted from Word or Google Docs.

**Notion structure:**
```
▶ Which antibiotic class inhibits cell wall synthesis by blocking transpeptidase?
    • Fluoroquinolones
    • **Beta-lactams**
    • Macrolides
    • Aminoglycosides
```

**What you get in Anki:**

- Front: the question stem with four labelled options (A–D)
- Back: option B highlighted green with the explanation block below

---

## Adding an explanation

Any non-bullet content inside the toggle (paragraph, quote, callout) becomes the explanation shown on the card back. Put it below the options.

**Notion structure:**
```
▶ Which finding is most specific for PE on ECG?
    ☑  S1Q3T3 pattern
    ☐  ST elevation in V1–V4
    ☐  Left bundle branch block
    ☐  Peaked T waves
    
    S1Q3T3 (large S in lead I, Q wave in lead III, inverted T in lead III) is
    a classic but uncommon finding in PE. Sinus tachycardia is the most
    common ECG finding.
```

---

## What falls back to a basic card

If the parser can't determine a single correct answer, it creates a standard toggle card instead (no MCQ behaviour, no error). These count toward the "skipped, no answer marked" figure shown after conversion.

| Situation | Behaviour |
|-----------|-----------|
| Zero checkboxes checked, zero items bolded | Basic card |
| Two or more checkboxes checked | Basic card |
| Two or more items fully bolded | Basic card |
| Only one option listed | Basic card |
| Mixed to-do + bullets in the same toggle | Basic card |

**Fix:** in Notion, open the toggle, check the correct option (or bold it), export again, and re-upload.

---

## Scope: Notion HTML exports only

MCQ detection runs on Notion HTML exports (`.zip` or `.html`). Markdown, XLSX, PPTX, and Google Docs uploads do not produce MCQ cards — those paths use the existing basic/cloze pipeline.
