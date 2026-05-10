# Docs Overhaul — Audit Report

Audit date: 2026-05-09. Scope: every file under `web/src/pages/DocsPage/content/`. Verdicts cross-checked against `src/routes/`, `src/lib/`, `src/controllers/`, `README.md`, `ROADMAP.md`, recent git log.

## 1. User-perspective summary

A new user landing on `/documentation` today sees a hero CTA pointing at "Getting started", a WIP banner asking them to file issues on GitHub, and a sidebar grouped Guides / Features / Troubleshooting / Advanced / Links / Misc. The first guide they read tells them flashcards are made by exporting Notion to HTML and uploading the zip — accurate but stale. **The core failure is that the docs describe the 2022-era product**: HTML/CSV/Markdown uploads with a Notion *export* flow. There is **zero documentation** of the actual current happy path — the direct Notion integration with the Find-pages picker, nested decks per page, page icons, and (for paying users) Claude AI generation and the Ankify two-way sync. A new user who connected their Notion will not find a single page that explains what just happened. Worst single offender: the FAQ, which reads like a 2020 personal blog and answers questions nobody is asking.

## 2. Per-file verdict table

| File | Verdict | Why |
|---|---|---|
| `index.mdx` | KEEP | Tiny landing hero, still correct. Designer can restyle later. |
| `guides/introduction.md` | REWRITE | Lists supported inputs reasonably but still frames the product as a Notion-export converter. Doesn't mention the direct Notion integration, Ankify, or AI generation. |
| `guides/getting-started.mdx` | REWRITE | Walks through Notion HTML export — that is no longer the recommended path. The current happy path is "connect Notion, pick a page, get a deck". |
| `features/notion-support.md` | REWRITE | Block-support list is plausibly still right but says nothing about the *integration* (OAuth, Find-pages picker, sync). Most users hit this page expecting that. |
| `features/markdown.md` | KEEP | Matches the `markdown-nested-bullet-points` card option in `supportedOptions.ts`. Has a typo in the description ("Markdonw") to fix. |
| `features/html.md` | KEEP | Matches `treatBoldAsInput` and cloze-from-`<code>` behaviour in `DeckParser.ts`. Still accurate. |
| `features/zip.md` | KEEP | Behaviour matches; cross-links are good. |
| `features/csv.md` | KEEP | Format matches. |
| `features/xlsx.md` | KEEP | Matches. |
| `features/tsv.md` | DELETE | Page exists only to say TSV isn't supported. Remove the file and the sidebar entry; redirect to CSV. Don't waste a slot in the IA on "this format we don't support". |
| `features/pdf.md` | REWRITE | Page-pairing description matches `convertPDFToImages.ts` and the 100-page limit is real, but the AI section conflates Claude with Vertex AI. Code has *both* `claude-ai-flashcards` and `vertex-ai-pdf-questions` as separate card options — the doc shows neither flag name and only mentions Claude. |
| `features/ppt.md` | KEEP | LibreOffice→PDF→images pipeline is real. Short and accurate. |
| `troubleshooting/common-problems.md` | REWRITE | Two problems covered. Both still relevant but tonally inconsistent with the rest, and there's an unmatched `]` after a video link. Should grow to 5–8 real problems pulled from support email, not stay at 2. |
| `troubleshooting/bug-report.md` | KEEP | Template is fine. The `/debug` page link works. |
| `troubleshooting/contact.md` | KEEP | Three sentences, accurate. |
| `troubleshooting/faq.md` | REWRITE | Half the entries are personal-blog content ("How do I become a successful developer?"). The actually-useful ones (cloze, input cards, images on front) are buried. Cut to product-only Q&A. |
| `troubleshooting/limits.md` | REWRITE | Numbers are mostly right (100 MB free / ~10 GB paid match `getUploadLimits.ts`; PDF 100 pages matches `convertPDFToImages.ts`; 2 hour cleanup matches `CLEANUP_AGE_SECONDS = 7200`). But the **"21 files"**, **"100 flashcards per deck"**, **"2,100 files"**, and **"no concurrent job limit"** claims have **no backing in the code I searched**. Either remove them or have engineer verify. The `/upload` UI also tells users files are deleted after 24 hours, contradicting this page's 2-hour claim — pick one and fix the UI. |
| `advanced/self-hosting.md` | REWRITE | Mostly correct (port 2020, LibreOffice, Poppler, Knex migrations, `WEB_BUILD_DIR`). Mentions only `NOTION_*` and `ANTHROPIC_API_KEY` as optional integrations — actual codebase also needs Stripe, SendGrid, Vertex AI, Bugsnag, Dropbox, Google Drive, Docker (for Ankify RAC). Two-repo split is described but the monorepo lives at `2anki/server` with `web/` as a workspace — needs engineer to confirm whether the standalone `2anki/web` repo is still the deployment target. |
| `advanced/terminology.md` | MERGE | Three short paragraphs that overlap with `advanced/domain.md`. Merge into one glossary page. |
| `advanced/domain.md` | MERGE | Better-written glossary than `terminology.md`. Keep this one's content, merge `terminology.md` into it, name the result "Glossary". |
| `advanced/napi.md` | KEEP | Correctly says the API is private, points at Swagger at `/api/docs`. Holds up. |
| `advanced/domain.md` (Domain ≠ DNS) | (covered above) | Note: title "Domain" is confusing — reads like DNS docs. Rename to "Glossary" when merging. |
| `advanced/strategy.md` | DELETE | Reads like an internal roadmap from a year ago ("v1", "v2"). User-facing docs should not contain strategy notes. The roadmap belongs in `ROADMAP.md` (which exists). |
| `links/anki.md` | KEEP | Three official links, accurate. |
| `links/community.md` | KEEP | Subreddit + AnkiDroid + awesome-anki. Trim formatting (loose H3s) but content is fine. |
| `links/youtube.md` | DELETE | Three random YouTube channels with no clear connection to 2anki. Doesn't help a new user; doesn't help retention. The frontmatter description is literally "x". |
| `links/support.md` | REWRITE | Mixes "support the project financially" (sponsorship) with "request support" (help). Confusingly named. Move sponsorship CTAs into the footer or a dedicated `/support-the-project` page; remove from docs IA. |
| `misc/privacy-policy.md` | MISSING-CONTEXT | Lists Hotjar and Google Analytics — both are present in `web/index.html`. Lists ChatGPT — I found **no OpenAI/ChatGPT usage** in `src/`; only Anthropic Claude and Google Vertex AI. Engineer must confirm whether ChatGPT processing was removed and whether Vertex AI should be added. Service list also missing: Stripe, SendGrid, Anthropic, Google Vertex AI, possibly Cloudflare. |
| `misc/terms-of-service.md` | MISSING-CONTEXT | Refers to a Notion-hosted privacy policy URL that is *different* from the in-product privacy policy. Legal text — defer to Alexander, not engineering. Do not rewrite without his sign-off. |

## 3. Gaps

What new users are looking for and **cannot find today**:

1. **"How do I sync my Notion deck after I edit a page?"** — Ankify and the Notion subscription/webhook flow are completely undocumented despite being the recent product focus (last 30+ commits).
2. **"What note types do I get and what do they look like?"** — `n2a-basic`, `n2a-cloze`, `n2a-input` namespaced templates exist, are seeded into Anki, and the welcome banner mentions them, but no doc page explains them.
3. **"Why did my upload fail?"** — common-problems covers 2 issues. Real failure modes (PDF over 100 pages on free, file too big, empty file, accidentally uploading an `.apkg`, Notion permission missing) all have specific server error messages that should be searchable in the docs.
4. **"What's the difference between uploading a file and connecting Notion?"** — never explained. The site has both `/upload` and `/ankify` routes; docs talk only about upload.
5. **"What does each Card Option do?"** — there are ~20 options in `supportedOptions.ts` (cherry, avocado, strikethrough tags, max-one-toggle, etc.). The descriptions live in code only. A reference page would cut a huge support-email category.
6. **"How do I get my deck into Anki on iPhone / Android / AnkiWeb?"** — no platform-specific import instructions.
7. **"What happens to my files? When are they deleted?"** — privacy policy mentions it weakly; users want a one-liner.
8. **"What do I get if I subscribe?"** — limits page lists paid perks but there is no honest "free vs paid" comparison page that links to `/pricing`.
9. **"Pricing"** — no docs entry at all.
10. **"How do I export my Anki review data back to Notion?"** — `ExportReviewDataToNotionUseCase` exists; users have no way to discover it.

## 4. Top 5 priorities

Ordered. Each priority states what to ship, why now, and effort.

1. **Rewrite `getting-started.mdx` around the Notion integration, not the HTML export.** Effort: M. The current page actively pushes users down a slower, more error-prone path. The fastest path to "drop something in, get a clean deck back" is `Connect Notion → pick a page → download deck`. Every new user hits this page; getting it right is the single highest-leverage doc change toward the 300K-user goal because the export-then-zip flow is where most first-time users currently fail. Keep the HTML/zip path as an "advanced upload" footnote.
2. **Write a new `features/ankify.md` (or `guides/sync-with-notion.md`) covering the sync flow.** Effort: M. The product team has spent the last weeks on Find-pages caching, nested decks, page icons, sync mappings, conflict resolution. Zero of it is documented. This is the feature most likely to convert free→paid because it's the one thing competitors don't do. Without a doc, users won't discover it.
3. **Create a `features/card-options.md` reference page.** Effort: S. Pull the descriptions straight from `src/controllers/CardOptionsController/supportedOptions.ts` (already user-facing). Trim the FAQ entries this replaces. This single page collapses a large bucket of support email and reduces churn from "I don't understand why my cards look wrong".
4. **Slim and correct `troubleshooting/limits.md` + `misc/privacy-policy.md`.** Effort: S. Limits page makes claims with no code backing (file count caps, deck card caps); privacy lists ChatGPT which appears unused, and is missing Stripe, SendGrid, Anthropic, Vertex AI. These are the two pages where being wrong actively damages trust. Quality over completeness — drop unverifiable numbers, list only confirmed processors.
5. **Rewrite `troubleshooting/common-problems.md` into a real "When it fails, do this" page.** Effort: S–M. Pull the actual error strings from `getUploadValidationError.ts`, `convertPDFToImages.ts`, the Notion permission errors, the Claude-quota errors. Make each a searchable heading. This is the page Google indexes from support queries — getting it right reduces both churn and inbound email volume.

## 5. What NOT to write

Scope discipline. These exist in the product but should stay undocumented:

- **The HTTP API surface beyond `napi.md`.** Already private; documenting endpoints invites integration work we can't support yet.
- **Webhook internals (`/webhook`, `AnkifyWebhookRouter`).** Internal infrastructure; users do not call these.
- **Self-hosting beyond a "yes you can, here's the repo, here are the env vars" page.** Self-hosters are <0.1% of users; we should not maintain a full ops manual. The current self-hosting page is borderline too detailed already.
- **Strategy / roadmap / "where we're heading".** Belongs in `ROADMAP.md`, not in user docs.
- **Per-card-option deep dives.** One reference page (priority 3) is enough — do not write a separate page per option.
- **Notion block-by-block compatibility matrix.** The current `notion-support.md` table is fine as one page; do not expand into per-block guides.
- **Vertex AI vs Claude AI comparisons.** Pick one (Claude, since it's the primary AI feature) and document it. Do not document the experimental Vertex AI PDF-questions option until it's promoted.
- **The `/debug` page beyond a single sentence in the bug-report doc.** It's already there; don't escalate it to its own page.
- **Cherry / avocado / strikethrough-tags edge-case options.** Mention in the card-options reference, do not give them tutorial pages.

## 6. Sidebar / IA recommendation

**Current shape** (Guides / Features / Troubleshooting / Advanced / Links / Misc) is organised by *content type*, not by *user task*. A new user reading top-to-bottom learns Notion HTML export before they learn that connecting Notion is even an option. Reorganise around the user's job, not ours.

**Recommended structure** (one option, recommended):

```
Start here
  - What is 2anki.net?              (was guides/introduction)
  - Connect Notion (5 min)          (NEW — replaces getting-started top half)
  - Upload a file (alt path)        (NEW — getting-started bottom half + zip/html essentials)

Make better cards
  - Card options reference          (NEW — priority 3 above)
  - Cloze, basic, input, reversed   (consolidates html.md examples)
  - Notion blocks supported         (was features/notion-support, trimmed)
  - Markdown / Obsidian             (was features/markdown)

Sync with Notion (paid)
  - How sync works                  (NEW — Ankify overview)
  - Two-way review export           (NEW)
  - Resolving conflicts             (NEW)

When it fails
  - Common problems                 (rewritten)
  - Bug report template
  - Limits & quotas
  - Contact

Reference
  - Glossary                        (merge of domain + terminology)
  - File formats                    (csv, xlsx, html, zip, pdf, ppt — short table not separate pages)
  - Self-hosting (advanced)
  - API access
  - Privacy policy
  - Terms of service

Links
  - Anki (official apps + manual)
  - Community
```

Three structural moves the Designer will care about:

- **Merge eight feature pages into one "File formats" reference table.** Right now CSV, XLSX, TSV, PPT, PDF, ZIP each get their own page despite most being 5 lines. A table with format / how it's parsed / limits / link is denser and more useful. Exception: keep HTML and Markdown as separate pages because they have meaningful examples.
- **Promote "Sync with Notion" to a top-level group.** It's the paid feature and the moat. Hiding it under "Features" buries it.
- **Drop "Misc" as a category.** Privacy/Terms go under Reference. YouTube link page goes away. "Strategy" page goes away.

The Designer should treat the labels above as drafts; the IA shape is the load-bearing part.
