# Design: SEO landing pages

**Author:** Designer. **Date:** 2026-05-10. **Input:** `Documentation/specs/seo-landing-pages.md` (PM), `docs/retros/2026-W19.md`.

This doc is the hand-off to engineer for the four pages: `/notion-to-anki`, `/quizlet-to-anki`, `/markdown-to-anki`, `/pdf-to-anki`. It is a complete design call, not options. Where the spec left a question, the answer is here.

The single most-opinionated decision: the hero uses `--color-bg-secondary` (flat off-white), not a colored or banded hero. These pages need to load fast, look like the rest of the site, and let the upload widget be the brightest thing on screen. Drama in the hero competes with the only CTA.

---

## 1. Page anatomy

Shared `<LandingPage>` template rendered by the four routes. Lives inside the existing `PageLayout` (top `NavigationBar` + `Footer`). No shell changes — the PM's open question on a minimal AppShell is resolved as **no**.

Sections, top to bottom:

1. **Hero** — H1, one-line subhead, `<UploadForm>` reused as-is, secondary text link.
2. **How it works** — 3 numbered steps, short.
3. **Supported file types** — one sentence + link to `/documentation/reference/file-formats`.
4. **One testimonial** — single blockquote, name + role. No carousel, no avatar.
5. **FAQ** — 4 questions, native `<details>` accordion, all closed by default.
6. **Footer CTA strip** — one line, links back to the upload widget anchor.

### Desktop wireframe (≥1024px)

```
+------------------------------------------------------------------+
| NavigationBar (existing)                                         |
+------------------------------------------------------------------+
|                                                                  |
|                                                                  |
|              H1 — left-aligned, max-width 18ch                   |
|              Subhead — secondary text, 1 line                    |
|                                                                  |
|         +----------------------------------------------+         |
|         |   UploadForm (drop zone + convert button)    |         |
|         +----------------------------------------------+         |
|         or sign up free   <— small text link below             |
|                                                                  |
+------------------------------------------------------------------+
| How it works                                                     |
| 1. Paste a link    2. We make the deck    3. Open in Anki        |
+------------------------------------------------------------------+
| Works with .pdf, .md, .docx, .html, .csv, .zip — full list ↗     |
+------------------------------------------------------------------+
| "Quote..."                                                       |
| — Name, role                                                     |
+------------------------------------------------------------------+
| FAQ                                                              |
| ▸ Question 1                                                     |
| ▸ Question 2                                                     |
| ▸ Question 3                                                     |
| ▸ Question 4                                                     |
+------------------------------------------------------------------+
| Ready? Paste a link or drop a file → (anchor link to #upload)    |
+------------------------------------------------------------------+
| Footer (existing)                                                |
+------------------------------------------------------------------+
```

Hero block is constrained to `max-width: 720px` and **left-aligned**, not centered. Centered headlines read like marketing pages; left-aligned reads like a tool. This is a tool.

### Mobile wireframe (375×667)

```
+------------------------------------+
| NavigationBar (56px tall)          |
+------------------------------------+
| H1 (text-3xl, 2 lines max)         |
| Subhead (text-base, 1–2 lines)     |
| +------------------------------+   |
| | UploadForm                   |   |
| | drop zone + "Click to..."    |   |
| +------------------------------+   |
| or sign up free                    |
| --- fold (≈667px) ---              |
| How it works                       |
| ...                                |
```

H1 + subhead + upload widget must all be visible above the fold on 375×667. See section 4 below.

---

## 2. Per-page copy

Voice rules from `web/src/pages/DocsPage/content`: second person, short sentences, no "simply" / "just" / "easily", lead with the user's verb. All four pages use the **same** "How it works" steps and supported-files sentence — only the H1, subhead, title, description, and FAQ change. This keeps maintenance trivial and the design honest: the conversion path is the same regardless of source.

### Shared (all four pages)

**How it works:**
1. **Paste or drop your file.** Notion link, PDF, Word, Markdown, or a Quizlet export.
2. **We make the deck.** Usually a few seconds. Bigger files take a minute.
3. **Open it in Anki.** Double-click the `.apkg` we send back. Your cards are ready to study.

**Supported file types sentence:**
> Works with Notion pages, PDF, Word (`.docx`), Markdown (`.md`), HTML, CSV, and Quizlet exports. [See the full list.](/documentation/reference/file-formats)

**Footer CTA strip:**
> Ready to try it? [Drop a file at the top of this page.](#upload)

---

### `/notion-to-anki` (primary)

- **`<title>`:** `Notion to Anki — convert pages to flashcards | 2anki` (59 chars)
- **`<meta name="description">`:** `Turn a Notion page into an Anki deck in seconds. Paste a link, get a .apkg file, study in Anki. Free for one deck at a time.` (124 chars)
- **H1:** `Turn a Notion page into Anki flashcards`
- **Subhead:** `Paste a Notion link and get a deck you can open in Anki.`

**FAQ:**

1. **Q: Does this work with toggles, callouts, and synced blocks?**
   A: Yes. Toggles become front/back cards, headings become tags, and synced blocks are read from the source page. If a block type is missing, send the page to support@2anki.net and we'll add it.

2. **Q: Do I need a Notion integration token?**
   A: For one-off pages, no — paste a public share link and we'll read it. For private workspaces, connect Notion once on the upload page; we use the token only to read the pages you pick.

3. **Q: What happens to images and code blocks?**
   A: Both come across. Images embed in the card, code blocks keep their formatting. Anything we can't fetch is replaced with a short note so the card still works.

4. **Q: Will it sync when I edit the Notion page later?**
   A: A one-time conversion is a snapshot. Re-paste the link to make a fresh deck. If you want changes to flow automatically, see [Hosted Anki](/pricing) — it polls Notion every few minutes.

---

### `/quizlet-to-anki`

- **`<title>`:** `Quizlet to Anki — convert sets to flashcards | 2anki` (54 chars)
- **`<meta name="description">`:** `Move a Quizlet set into Anki without copy-pasting. Upload your export, get a .apkg deck back, keep studying.` (109 chars)
- **H1:** `Move your Quizlet set to Anki`
- **Subhead:** `Export from Quizlet, drop the file here, and download an Anki deck.`

**FAQ:**

1. **Q: How do I get my set out of Quizlet?**
   A: Open the set, click the three dots, choose Export, and copy the text into a `.txt` file (or paste into the box on the upload page). Drop that file here and we'll make the deck.

2. **Q: Do my starred or learned cards come across?**
   A: The card content does. Quizlet's study state — starred, mastered, in-progress — isn't in the export, so it doesn't transfer. Anki will start each card fresh, which most learners prefer anyway.

3. **Q: What about image-only cards?**
   A: Image cards work if the export includes image URLs. Quizlet's plain-text export is text-only, so images are skipped. If you have Quizlet Plus, the richer export keeps them.

4. **Q: Is this allowed under Quizlet's terms?**
   A: You're moving your own study material between apps you own accounts on. We don't scrape Quizlet — we only read the file you upload. If you don't have an export, we can't help.

---

### `/markdown-to-anki`

- **`<title>`:** `Markdown to Anki — convert .md files to decks | 2anki` (54 chars)
- **`<meta name="description">`:** `Convert a Markdown file into an Anki deck. Headings become tags, lists become cards, code blocks keep their formatting.` (118 chars)
- **H1:** `Turn Markdown notes into Anki cards`
- **Subhead:** `Drop a `.md` file and download a deck — headings, lists, and code all come across.`

**FAQ:**

1. **Q: How are cards made from my Markdown?**
   A: Each top-level bullet becomes a card. A nested bullet underneath is the answer. Headings above the list become the deck name and tags. There's a full guide in [the docs](/documentation/reference/file-formats).

2. **Q: Can I use my own card template?**
   A: Yes — `.md` files with YAML frontmatter or HTML `<style>` blocks pass through. If you want question/answer pairs in a specific format, write them as `Q: ... / A: ...` and we'll detect it.

3. **Q: Does it handle code blocks and LaTeX?**
   A: Triple-backtick code blocks keep their language and formatting in Anki. LaTeX inside `$...$` and `$$...$$` renders if you have MathJax enabled in Anki — turn it on in card template settings.

4. **Q: What if my file has thousands of bullets?**
   A: We'll convert all of them. Big files take longer — usually under a minute for 1,000 cards. If the file is over 50MB, split it first or upload a zip of smaller files.

---

### `/pdf-to-anki`

- **`<title>`:** `PDF to Anki — turn lecture notes into flashcards | 2anki` (57 chars)
- **`<meta name="description">`:** `Upload a PDF and get an Anki deck. Works with lecture slides, textbook chapters, and exported notes. No copy-pasting.` (117 chars)
- **H1:** `Make Anki flashcards from a PDF`
- **Subhead:** `Drop a PDF and we'll pull out the text you can turn into cards.`

**FAQ:**

1. **Q: Will it read scanned PDFs?**
   A: Only if the scan has a text layer (OCR). Most modern textbooks and slide exports do. If yours is a photo of a page with no text layer, run it through an OCR tool first — macOS Preview and Adobe Acrobat both do this.

2. **Q: How does it pick what becomes a card?**
   A: Headings become deck and tag names. Bullet points and short paragraphs become card fronts; the next line or indent becomes the back. You can edit the cards in Anki after — we don't lock anything down.

3. **Q: Can I upload a whole textbook?**
   A: Yes, but big PDFs take longer and can create huge decks. We recommend uploading one chapter at a time — easier to review, easier to share, and Anki handles 500-card decks better than 50,000-card ones.

4. **Q: What about diagrams and equations?**
   A: Diagrams come across as embedded images. Equations rendered as images stay images; equations stored as text need MathJax enabled in your Anki card template to display.

---

## 3. Visual treatment

All values are existing tokens from `web/src/styles/base.css`. No new colors, no new fonts.

### Hero

| Property | Value | Why |
| --- | --- | --- |
| Background | `--color-bg-secondary` (`#f9fafb`) | Matches homepage, lets the white upload-form card pop. Not `--color-primary` — saturated blue across a full-width hero competes with the upload button. |
| H1 size | `--text-5xl` desktop, `--text-3xl` mobile | One step down from the homepage's `--text-8xl`. These are tool pages, not a marketing splash. Smaller hero = the upload widget appears higher on the screen. |
| H1 weight | `--font-semibold` | Matches docs and shared.module.css `.title`. |
| H1 tracking | `--tracking-tight` | Matches existing `.title`. |
| Subhead size | `--text-lg` desktop, `--text-base` mobile | Reads as one breath. |
| Subhead color | `--color-text-secondary` | Lower-contrast than H1; reinforces hierarchy. |
| Upload form | Untouched. Reuse as-is. | Don't restyle the only CTA. |
| Secondary link | `<Link>` text, `--text-sm`, `--color-text-secondary` | Reads as "if you'd rather not upload right now" — never competes with the upload widget. |
| Hero padding | `4rem 1.5rem` desktop, `2rem 1rem` mobile | Tighter than homepage; gets widget above the fold on 375×667. |

### How it works

| Property | Value |
| --- | --- |
| Background | **Flat** — same `--color-bg-secondary` as hero. No banding. |
| Layout | `composes: columns3` from `shared.module.css` desktop; single column mobile. |
| Step number | `--text-2xl`, `--color-primary`, `--font-semibold` |
| Step title | `--text-lg`, `--font-semibold`, `--color-text-primary` |
| Step body | `--text-sm`, `--color-text-secondary`, `--leading-normal` |
| Card | `composes: sectionCard` from `shared.module.css` |

Banded backgrounds (alternating `--color-bg-primary` / `--color-bg-secondary` between sections) read as marketing-page rhythm. These pages are short enough that the rhythm just chops up a single scroll. One flat background end-to-end.

### FAQ

| Property | Value |
| --- | --- |
| Element | Native `<details><summary>` | No JS, no library, accessible by default. |
| Summary | `--text-base`, `--font-medium`, `--color-text-primary` |
| Answer | `--text-sm`, `--color-text-secondary`, `--leading-relaxed`, `max-width: 60ch` |
| Divider | `border-top: 1px solid var(--color-border)` between items |
| Initial state | All closed | Encourages the reader to scan questions first. |

### Testimonial

Single blockquote, no avatar, no carousel.

| Property | Value |
| --- | --- |
| Container | `composes: sectionCard` |
| Quote | `--text-lg`, `--color-text-primary`, italic |
| Attribution | `--text-sm`, `--color-text-secondary`, prefixed with `— ` |

Pull a real quote from existing site copy or recent support emails. Engineer to coordinate with PM on which one. **Do not write a fake quote.**

### Footer CTA strip

Single line. Anchor link `#upload` scrolls to the hero upload widget. `--color-bg-secondary` background, centered text, `--color-text-link` accent on the link.

---

## 4. Mobile-first sanity check

**Requirement:** at 375×667 viewport, the user must see H1 + subhead + upload widget drop zone (at least the "Drag and drop your files here" text and the convert button) **without scrolling**.

Budget at 375×667:

| Element | Height |
| --- | --- |
| NavigationBar | ~56px |
| Hero top padding | 32px (`2rem`) |
| H1 (2 lines at `--text-3xl`) | ~88px |
| Subhead margin + 2 lines `--text-base` | ~56px |
| UploadForm drop zone (visible portion) | ~340px |
| **Total** | **~572px** of 667px |

Fits with ~95px headroom. **One-line fix if engineer measures and overshoots:** drop hero top padding to `1.5rem` on mobile (saves 8px) and clamp the H1 to a single line via `max-width: 14ch` (forces wrap below 14 chars). If the H1 still wraps to 3 lines on smaller phones (≤360px), accept it — the upload widget partially visible (drop zone label still readable) is still a successful first impression.

The "or sign up free" link is allowed to fall below the fold on mobile. It's a secondary action — the primary action is the upload widget, and that stays visible.

---

## 5. Voice / copy rules engineer must not violate

- Second person ("you", "your"). Never "users", "the user".
- No "simply", "just", "easily", "powerful", "seamless".
- Lead each sentence with the user's verb. ("Paste a Notion link." not "A Notion link can be pasted.")
- Numbers as digits ("3 steps", not "three steps"). Reads tighter, scans faster.
- The product is "2anki". Lowercase, no space, no dot. Never "2Anki" or "2anki.net" in body copy (URL only).
- File extensions in code voice: `.apkg`, `.md`, `.pdf`. Card type names in plain text: Notion, Anki, Quizlet.

---

## 6. Out of scope (declined on purpose)

- **No testimonial carousel.** One quote. If we have three good ones, pick the strongest. Carousels reduce perceived honesty and add JS.
- **No hero animation.** No fade-in, no typewriter, no gradient sweep. The page should feel instant.
- **No hero illustration, SVG, or screenshot.** Type-led. A screenshot of Anki would date the page and slow first paint.
- **No "trusted by X students" counter.** We don't have a reliable number; a fuzzy one undermines trust.
- **No comparison table** ("2anki vs Quizlet", "2anki vs RemNote"). Tempting on `/quizlet-to-anki` — declining. Comparison content reads as defensive and invites the visitor to leave and check the other product.
- **No newsletter signup, no exit-intent modal, no chat widget.** One CTA per page.
- **No video.** A 30-second screencast would help, but it adds weight and a maintenance burden, and the upload widget itself is fast enough to demonstrate the product live.
- **No dark-mode-specific work.** The site doesn't ship a dark mode today; don't introduce one here.
- **No cookie banner / consent popup.** Out of scope per the brief; not the designer's call.

---

## 7. Hand-off summary for engineer

**Component:** `web/src/pages/LandingPage/LandingPage.tsx` accepting a single `copy` prop with the shape:

```ts
interface LandingCopy {
  pathname: string;        // '/notion-to-anki' — used for ?source= and canonical
  title: string;           // <title>, ≤60 chars
  description: string;     // <meta description>, ≤155 chars
  h1: string;
  subhead: string;
  faqs: Array<{ q: string; a: string }>;
}
```

`steps`, `fileTypes`, `testimonial`, and `footerCta` are **constants inside the template**, not props. They're identical across all four pages — sharing them in code is honest.

**Co-located CSS:** `web/src/pages/LandingPage/LandingPage.module.css`. Reuse `shared.module.css` (`sectionCard`, `columns3`, `title`, `subtitle`) wherever a class already exists.

**Files to create:**
- `web/src/pages/LandingPage/LandingPage.tsx`
- `web/src/pages/LandingPage/LandingPage.module.css`
- `web/src/pages/LandingPage/copy/notion.ts`
- `web/src/pages/LandingPage/copy/quizlet.ts`
- `web/src/pages/LandingPage/copy/markdown.ts`
- `web/src/pages/LandingPage/copy/pdf.ts`

**Things to verify before merge:**
- Lighthouse mobile score ≥90 (perf and accessibility) on the prerendered HTML.
- H1 + subhead + upload widget visible on 375×667 with no scroll (Chrome DevTools iPhone SE preset).
- `<title>` and `<meta description>` present in static HTML (view-source), not just after JS executes.
- `?source=<pathname>` reaches the `users.signup_origin` column when the secondary "sign up free" link is followed and a registration is completed.
- No console errors on any of the four routes when logged in or logged out.

**Engineer is free to deviate from copy** if they spot a factual error in an FAQ answer (e.g. wrong export menu name in Quizlet). Run the deviation past PM in the PR description.
