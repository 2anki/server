# Docs Overhaul — Design Spec

Author: Designer. Date: 2026-05-09. Inputs: `docs-overhaul-audit.md`, current `web/src/pages/DocsPage/`.

This document is the brief the Engineer writes content and code against. Read it once, ship from it.

---

## 1. Final IA

The sidebar tree, in order. Group labels are user-facing.

```
Start here
  - What is 2anki?                       (start-here/what-is-2anki)
  - Connect Notion in 5 minutes          (start-here/connect-notion)
  - Upload a file instead                (start-here/upload-a-file)
  - Open your deck in Anki               (start-here/open-in-anki)

Make better cards
  - Card options                         (cards/card-options)
  - Card types (basic, cloze, input)     (cards/card-types)
  - Notion blocks we support             (cards/notion-blocks)
  - Markdown and Obsidian                (cards/markdown)
  - HTML                                 (cards/html)

Sync with Notion
  - How sync works                       (sync/how-it-works)
  - Send your reviews back to Notion     (sync/review-export)
  - When sync gets stuck                 (sync/troubleshooting)

When something breaks
  - Common problems                      (help/common-problems)
  - Limits and quotas                    (help/limits)
  - Report a bug                         (help/bug-report)
  - Contact us                           (help/contact)

Reference
  - Glossary                             (reference/glossary)
  - File formats                         (reference/file-formats)
  - Self-hosting                         (reference/self-hosting)
  - API access                           (reference/api)
  - Privacy policy                       (reference/privacy)
  - Terms of service                     (reference/terms)

Links
  - Official Anki                        (external: https://apps.ankiweb.net/)
  - Community                            (links/community)
```

Reasoning: groups are jobs ("Start here", "When something breaks"), not content types ("Guides", "Misc"); a first-time user can read top-to-bottom and reach a working deck without backtracking, and the paid feature (sync) gets its own visible group instead of being buried under "Features".

Slug renames break old links — Engineer adds redirects from old slugs in `loader.ts` (small map; one line each).

---

## 2. Per-page structure

Skeletons are tight on purpose. If the Engineer needs more than what's listed, the page is doing too much and should be split.

### Start here

**`start-here/what-is-2anki`**
- H1: What is 2anki?
- Summary: 2anki turns your Notion pages and study files into Anki decks.
- Sections: What you can drop in · What you get back · Two ways to use it (connect Notion vs upload a file) · Free and paid in one sentence each

**`start-here/connect-notion`** (the load-bearing page — most users land here)
- H1: Connect Notion in 5 minutes
- Summary: From signing in to your first deck downloaded.
- Sections: Step 1 — Sign in with Notion · Step 2 — Pick a page · Step 3 — Download your deck · Step 4 — Open it in Anki · What if a page won't show up?
- Each step gets one screenshot. No long prose.

**`start-here/upload-a-file`**
- H1: Upload a file instead
- Summary: For PDFs, slides, spreadsheets, or a Notion HTML export.
- Sections: When to use upload instead of Connect Notion · Drop in a file · Supported types (link to File formats) · What happens to your file (link to Privacy)

**`start-here/open-in-anki`**
- H1: Open your deck in Anki
- Summary: Get the `.apkg` you downloaded into Anki on any device.
- Sections: Anki desktop · AnkiMobile (iPhone/iPad) · AnkiDroid (Android) · AnkiWeb · Updating an existing deck

### Make better cards

**`cards/card-options`**
- H1: Card options
- Summary: Every checkbox on the upload screen, what it does, and when to turn it on.
- Sections: How to set options · Reference table (option name, plain-language description, default, example before/after)
- Engineer pulls names and descriptions from `src/controllers/CardOptionsController/supportedOptions.ts`. One row per option. No per-option pages.

**`cards/card-types`**
- H1: Card types
- Summary: The three card shapes 2anki makes, and when each fires.
- Sections: Basic (toggle → front/back) · Cloze (`{{c1::...}}` and code-as-cloze) · Input (typed answer) · How to switch between them

**`cards/notion-blocks`**
- H1: Notion blocks we support
- Summary: What works, what's ignored, what's coming.
- Sections: Supported (table) · Partial support · Not yet supported · Tips for clean cards

**`cards/markdown`**
- H1: Markdown and Obsidian
- Summary: Use a Markdown file or Obsidian vault as the source.
- Sections: How nesting becomes cards · Front/back syntax · Cloze syntax · Limits

**`cards/html`**
- H1: HTML
- Summary: How 2anki reads an HTML page or a zipped Notion HTML export.
- Sections: Toggle blocks become cards · Bold-as-input · Code-as-cloze · Images and assets

### Sync with Notion

**`sync/how-it-works`**
- H1: How sync works
- Summary: Edit a Notion page, get the updated deck — without re-uploading.
- Sections: What sync does · Setting up sync on a page · How updates flow (Notion → 2anki → Anki) · Free vs paid

**`sync/review-export`**
- H1: Send your reviews back to Notion
- Summary: Push how often you got each card right back into your Notion database.
- Sections: What you'll see in Notion · Turning it on · Required Notion properties · Limits

**`sync/troubleshooting`**
- H1: When sync gets stuck
- Summary: Three things to try when your deck won't update.
- Sections: Page didn't sync · I see a duplicate deck · I revoked access by mistake · Still stuck? (links to contact)

### When something breaks

**`help/common-problems`**
- H1: Common problems
- Summary: The errors users actually hit, with the fix on the same page.
- Sections: One H2 per error, each with — What you saw · Why it happened · How to fix it. Engineer pulls the exact strings from `getUploadValidationError.ts`, `convertPDFToImages.ts`, Notion permission errors, Claude quota errors. Aim for 6–8 entries.

**`help/limits`**
- H1: Limits and quotas
- Summary: What's allowed on free, what's allowed on paid, and how long files stick around.
- Sections: File size · PDF pages · Storage time · Free vs paid (link to /pricing). Engineer drops every number that isn't backed by code.

**`help/bug-report`**
- H1: Report a bug
- Summary: A short template that gets you a fast reply.
- Sections: Before you report (one-line checklist) · Template (copy-paste block) · Where to send it · The `/debug` page

**`help/contact`**
- H1: Contact us
- Summary: Three ways to reach a human.
- Sections: Email · GitHub · Discord/community

### Reference

**`reference/glossary`** (merged from `domain` + `terminology`)
- H1: Glossary
- Summary: Words 2anki and Anki use, in plain language.
- Sections: One alphabetical definition list. No subheadings.

**`reference/file-formats`** (replaces six pages)
- H1: File formats
- Summary: Every input we accept and how it's read.
- Sections: One table — Format · How 2anki reads it · Limits · Notes. Below the table, two short subsections that *do* need prose: HTML and Markdown link out to their own pages.

**`reference/self-hosting`**
- H1: Self-hosting
- Summary: You can run 2anki yourself. Here's the short version.
- Sections: Repo and license · System requirements · Required env vars · Optional integrations · Where to get help

**`reference/api`**
- H1: API access
- Summary: There's no public API yet.
- Sections: One paragraph. Link to Swagger at `/api/docs` for self-hosters.

**`reference/privacy`** — content rewrite owned by Alexander, not Engineer. Keep the page; mark `MISSING-CONTEXT` from the audit on the spec but don't touch copy.

**`reference/terms`** — same. Defer to Alexander.

### Links

**`links/community`**
- H1: Community
- Summary: Where Anki users hang out.
- Sections: Subreddit · AnkiDroid · awesome-anki

---

## 3. DocsHome (`index.mdx`) layout

Replace the current centered hero. The landing page should answer "what now?" in three seconds.

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│   2anki documentation                                            │
│   The simplest way to turn what you're studying into Anki cards. │
│                                                                  │
│   [ Connect Notion in 5 min → ]   [ Upload a file ]              │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Start here                                                      │
│  ┌────────────────────┐  ┌────────────────────┐                  │
│  │ What is 2anki?     │  │ Connect Notion     │                  │
│  │ A 60-second tour.  │  │ The fastest path.  │                  │
│  └────────────────────┘  └────────────────────┘                  │
│  ┌────────────────────┐  ┌────────────────────┐                  │
│  │ Upload a file      │  │ Open in Anki       │                  │
│  │ PDFs, slides, CSV. │  │ Desktop and mobile.│                  │
│  └────────────────────┘  └────────────────────┘                  │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Popular pages                                                   │
│  • Card options reference                                        │
│  • Common problems                                               │
│  • How sync works                                                │
│  • Limits and quotas                                             │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Stuck? Email alexander@alemayhu.com or open an issue on GitHub. │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

Decisions:

- Drop the mascot from the landing page. It's charming on the marketing site; on a docs landing it costs ~180px of vertical space before the user sees a single link. Keep it for `/` and `/about`, not here.
- Primary CTA is **"Connect Notion in 5 min →"** linking to `/documentation/start-here/connect-notion`. Secondary is **"Upload a file"** linking to `/documentation/start-here/upload-a-file`. No third action.
- The four "Start here" cards are the four pages of the Start here group. Each card: title + one-line summary, full card is the click target, no icon.
- "Popular pages" is a hand-curated four-link list, not analytics-driven. Update when content lands.

**Recommendation: rewrite `DocsHome.tsx`.** The current file is 30 lines of MDX-frontmatter shape (`hero`, `actions`) that aren't actually parsed — it's deceiving. Replace with a simple TSX component that renders the structure above using existing `shared.module.css` tokens. `index.mdx` stays as the slug-zero entry and contains only the Popular pages list as Markdown so it's editable without touching code; the hero and cards live in `DocsHome.tsx`.

---

## 4. Sidebar UX

One design, no toggles.

- **Groups stay flat and always expanded.** Collapsible groups add a click and hide content from people scanning. The IA is short enough (six groups, ~25 leaves) to not need it.
- **Sticky on desktop.** Already sticky — keep.
- **Active-item highlight stays.** Already there.
- **Add: section indicator.** When the user is inside a group, that group's label gets a subtle left border (`border-left: 2px solid var(--color-primary)`, only on the active group's items) to anchor the user.
- **Mobile: full-screen drawer, not inline expand.** Current "Menu" button toggles an inline panel above content — fine but feels cramped on 375px. Replace with a slide-in drawer from the left, full height, with a close button. Triggered by the same button. Body scroll-locked while open.
- **No search bar.** Out of scope per constraints, and the IA is small enough that scanning works.
- **No "on this page" / table-of-contents rail on the right.** Pages are short by design (skeletons above). If a page grows past ~5 H2s, that's a sign to split it.

---

## 5. Page template / content components

Invest in a small set. Each is worth the engineering only because it shows up across many pages.

Keep:
- Headings, paragraphs, lists, tables, blockquote, inline code, fenced code blocks, images. All already styled.
- Edit-on-GitHub link (already exists, keep).
- Prev/next pager (already exists, keep — fix labels to be human, not slug-cased).

Add:
1. **Callouts** — `:::note`, `:::tip`, `:::warning` rendered as a styled box with an icon-free coloured left border. Three variants, no more. Use a `remark-directive` plugin or a small custom remark transform; do not invent MDX components per callout type.
2. **Step blocks** — for the "Connect Notion in 5 min" page and the bug-report template. Render an `<ol>` with bigger numbers and more padding. Implement as plain HTML/Markdown via a `class="steps"` wrapper that the Engineer applies in MDX.
3. **Code block copy button** — small "Copy" button top-right of every `<pre>`. One file, ~20 lines. High value for env-var blocks and bug-report templates.
4. **Screenshot frame** — images already get a border + radius. Add `figure` + optional `figcaption` support so screenshots can have a caption without extra components. Use the standard Markdown image-with-title syntax.

Reject:
- Tabs (e.g. macOS / Windows / Linux). Audit shows almost no place needs them; when one does, two H3s do the job.
- Accordions. `<details>` is already styled; that's enough.
- Embedded video player. Link out to YouTube; don't iframe.
- Per-page TOC component. See sidebar section.

---

## 6. Visual style

Stay inside `shared.module.css` tokens. No new colour primitives.

- **Type scale:** keep current. H1 `text-4xl`, H2 `text-2xl` with bottom border, H3 `text-xl`, body `text-base`, leading `relaxed`. The current scale is already Stripe-class.
- **Measure:** keep `max-width: 760px` on `.article`. Don't widen — long lines hurt scan.
- **Spacing rhythm:** tighten H2 top margin from `2rem` to `2.5rem` so sections breathe. H3 stays at `2rem`. Paragraph bottom margin stays at `1rem`.
- **Links:** keep underlined-blue. The understated underline is correct for docs; don't switch to hover-only underlines.
- **Callout colours:**
  - note → `var(--color-primary-light)` bg, `var(--color-primary)` left border
  - tip → `var(--color-success-light)` bg, `var(--color-success)` left border
  - warning → `var(--color-warning-light)` bg, `var(--color-warning)` left border
- **Code:** keep dark `pre` block. Add a 1px `var(--color-border)` to `pre` so it sits on light backgrounds with the same weight as cards.
- **WipBanner:** keep, but soften copy and shrink. New copy:
  > These docs are being rewritten. If something looks wrong, [open an issue](…) — we read every one.

  Drop the "WIP" pill (the badge feels alarming). Keep the warning palette but reduce padding to `0.5rem 0.875rem` and font to `text-sm`. Banner sits above the article header on every doc page including the home.

---

## 7. Component changes

Concrete file-level guidance.

### `sidebar.ts`
New shape: same `SidebarGroup` / `SidebarItem` types, just new contents. Example entry to make the renames concrete:

```ts
{
  label: 'Start here',
  items: [
    { label: 'What is 2anki?', slug: 'start-here/what-is-2anki' },
    { label: 'Connect Notion in 5 minutes', slug: 'start-here/connect-notion' },
    { label: 'Upload a file instead', slug: 'start-here/upload-a-file' },
    { label: 'Open your deck in Anki', slug: 'start-here/open-in-anki' },
  ],
},
```

Plus a new `redirects` map alongside the export, like `{ 'guides/getting-started': 'start-here/connect-notion', 'features/csv': 'reference/file-formats', ... }`. `loader.ts` consults it when a slug misses.

### `DocsPage.tsx`
- Replace inline mobile menu toggle with a portal-rendered drawer (existing `useState` is fine; add body scroll lock when `menuOpen`).
- No layout grid changes.

### `DocsSidebar.tsx`
- Add active-group detection: walk `sidebar` to find which group contains the current slug, pass an `activeGroup` flag into the group render to apply the left-border class.
- Add drawer-mode props (`isDrawer: boolean`, `onClose: () => void`) so the same component renders in both desktop sidebar and mobile drawer. Don't fork.

### `DocsHome.tsx`
- Rewrite. New JSX: hero (h1 + tagline + two buttons), Start here cards grid (4 cards, `columns2`), Popular pages list (rendered from `index.mdx` body via the existing markdown pipeline — pass MDX body in as children), footer line.
- Reuse `shared.module.css` tokens: `btnPrimary`, `btnSecondary`, `card`, `columns2`.

### `DocContent.tsx`
- Add `remark-directive` + a small custom transform for `:::note`, `:::tip`, `:::warning` → `<aside class="callout callout-note">…</aside>`.
- Add a `CodeBlock` component slot for `pre > code` rendering with a copy button. Keep ReactMarkdown's `components` map small — one entry for `pre`.
- Pager labels: pull from `frontmatter.title` rather than the sidebar `label` if both exist, so frontmatter is the source of truth.
- "Last updated" line: skip. Git timestamps surprise users; the edit-on-GitHub link is enough.

### `DocsPage.module.css`
Add:
- `.callout`, `.calloutNote`, `.calloutTip`, `.calloutWarning`
- `.steps` (numbered list with larger numerals)
- `.codeWrapper`, `.copyButton` (positioned top-right of `.markdown pre`)
- `.figure`, `.figcaption`
- `.sidebarGroupActive` (left border on active group's item list)
- `.drawer`, `.drawerOpen`, `.drawerBackdrop` (replace inline mobile sidebar styles)
- `.homeCard`, `.homeCardTitle`, `.homeCardDesc`, `.homeGrid`, `.popularList`

Change:
- `.wipBanner` — reduced padding/font, drop `.wipLabel` styling (component drops the pill).
- `.markdown h2` — top margin to `2.5rem`.
- `.markdown pre` — add `1px solid var(--color-border)`.

Remove:
- `.hero*` classes (move to a new `.docsHomeHero` set since the layout is different).
- `.heroImage` — landing image is gone.

### New components
- `Callout.tsx` — renders `<aside>` with variant class. ~15 lines.
- `CodeBlock.tsx` — wraps `<pre>` with a copy button. ~30 lines.
- `DocsDrawer.tsx` — mobile drawer wrapping `DocsSidebar`. ~40 lines including focus trap and body scroll lock.

That's three small components total. No more.

---

## 8. Voice and tone

Write to one reader: a student or knowledge worker, not a developer. Address them as **you**. Use **we** for 2anki when something is on us ("we couldn't read this page"). Sentences are short — usually under 20 words; aim for fewer commas, more periods. Lead with the user's verb ("Pick a page", not "The user selects a page"). Use second person for every instruction ("Click Download", "Paste your link"). Skip hedging words ("simply", "just", "easily") — they sound condescending and add nothing. Use examples over prose for anything mechanical (a code block, a screenshot, a copy-pasteable template); use prose only for *why* something exists. Never use "render", "parse", "endpoint", "instance", "payload", or "schema" in user-facing text — if one of those is the only honest word, explain it inline. Keep contractions ("it's", "you'll") — they read warmer without losing precision. One exclamation point per page maximum, and probably zero.

---

## 9. Out of scope (intentionally not designed)

So the Engineer doesn't add these back:

- **Search bar.** Per constraints. The IA is small; scanning works.
- **i18n / localized docs.** Per constraints. Voice spec assumes English-only for now.
- **Versioned docs.** No `v1` / `v2` toggle; we ship one current version.
- **Analytics events on doc pages.** Per constraints. Don't instrument.
- **A separate `/changelog` page in the docs IA.** Already lives elsewhere; don't duplicate.
- **Per-card-option page.** One reference page only. The audit explicitly rejects per-option deep dives.
- **Per-Notion-block tutorial pages.** One support matrix table. Don't expand.
- **Vertex AI documentation.** Document Claude AI only (`features/pdf` rewrite mentions "AI flashcards" generically; no Vertex page).
- **YouTube links page.** Audit deletes it; don't reintroduce.
- **Sponsorship / "support the project" page in docs.** Belongs in the global footer, not the docs IA.
- **`/debug` as its own page.** One sentence in the bug-report page.
- **Light/dark mode toggle for docs.** The site doesn't have one yet; docs don't get one alone.
- **Comment threads / "was this helpful" voting.** No infra for it; out of scope.
- **TOC rail / "On this page".** Pages are short. If one grows long, split it.
- **MDX interactive widgets.** Per constraints — Markdown/MDX content only, no React-only blocks beyond the small set in section 5.

---

## Hand-off checklist for the Engineer

1. Update `sidebar.ts` to the IA in section 1, including the redirects map.
2. Update `loader.ts` to honour redirects on miss.
3. Move/rename content files to match new slugs; create new files as empty stubs first so routing works.
4. Rewrite `DocsHome.tsx` per section 3.
5. Add `Callout.tsx`, `CodeBlock.tsx`, `DocsDrawer.tsx`.
6. Wire callout directive through ReactMarkdown.
7. Apply CSS deltas in section 7.
8. Soften `WipBanner` copy and styles per section 6.
9. Write content against the skeletons in section 2, in the voice from section 8.
10. Manual pass on 375px viewport. Drawer opens, no horizontal scroll, hero CTAs stack.
