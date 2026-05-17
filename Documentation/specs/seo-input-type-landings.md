# Spec: SEO landing page per input type

## Problem

12-month GA4 (2025-05-18 → 2026-05-18) shows 18,949 users from Organic Search — 26% of all acquisition, the second-largest channel after Direct. 95% of those organic landings hit `/`, one page absorbing every query regardless of intent. A student searching "convert pdf to anki" and a developer searching "markdown to anki" both land on the same generic hero. Neither gets a page that speaks to their specific tool or workflow.

One React template, six pages, each targeting its own long-tail query family. Compounds for years. The Notion Marketplace launch in flight makes the Notion-specific page especially timely.

## Goal

Grow organic search traffic by creating indexable, format-specific landing pages that rank for long-tail queries. Move organic users toward 300K total users by compounding durable search traffic rather than depending on a single generic landing.

## Proposed approach

Six pages, one per supported input type, all sharing a single React template driven by a config file.

| Route | Primary target queries |
|---|---|
| `/convert/notion-to-anki` | "convert notion to anki", "notion to anki", "notion flashcards anki" |
| `/convert/pdf-to-anki` | "convert pdf to anki", "pdf to anki cards", "make anki cards from pdf textbook" |
| `/convert/markdown-to-anki` | "markdown to anki", "obsidian to anki" |
| `/convert/csv-to-anki` | "csv to anki", "spreadsheet to anki", "excel to anki" |
| `/convert/html-to-anki` | "html to anki", "webpage to anki" |
| `/convert/apkg-to-csv` | "edit anki deck", "apkg to spreadsheet" |

Each page has: an H1 naming the input format, a one-paragraph explainer (input → output), an upload CTA pre-configured for that format, a small example with sample data, and a 2–3 question FAQ targeting the format's common queries.

SEO mechanics:
- Unique `<title>` and `<meta description>` per route, both naming the format.
- `<link rel="canonical">` per page.
- Server-rendered or prerendered HTML so Google indexes the content. If the current build is SPA-only, add a build-time prerender step (Vite SSG or `vite-plugin-ssr`). Verify before implementing.
- Internal links from `/` and `/pricing` to each landing page.
- Sitemap updated with all six URLs.

Copy follows VOICE.md: sentence case headings, specific over generic ("PDF to Anki — turn lecture slides into spaced-repetition cards"), no exclamation marks, no fake warmth. The reader is a student mid-search; one paragraph, one CTA.

## Files touched

| File | Change |
|---|---|
| `web/src/pages/ConvertLandingPage/` | New shared component + colocated tests |
| `web/src/data/convertLandingPages.ts` | Page config — title, meta description, H1, explainer copy, FAQ per format |
| `web/src/App.tsx` | Register `/convert/:slug` routes |
| `web/public/sitemap.xml` | Add six new URLs |
| `web/vite.config.ts` | SSG/prerender step if build is currently SPA-only |

## Success criteria

- All six pages are live and return indexable HTML (verified via `curl` or Google Search Console URL inspection).
- Within 90 days, at least 3 of 6 pages rank top-10 for their primary target query.
- Within 6 months, organic traffic to `/convert/*` is greater than 10% of organic traffic to `/`.

## Out of scope

- AI-channel optimization (separate spec `ai-channel-optimization`).
- PDF input quality improvements (separate spec `pdf-to-anki`); the `/convert/pdf-to-anki` page can ship and pull traffic independently.
- Paid acquisition.
- Localized or translated versions of the pages.

## Open questions

1. Is the current web build SPA-only? If so, does a Vite SSG plugin fit cleanly, or does the existing router and lazy-loading setup need adjustment first?
2. Should `/convert/apkg-to-csv` describe a reverse conversion (Anki → spreadsheet) or is there a different reverse-use-case page that has higher search volume?
3. Internal linking from `/pricing` — which format-specific pages are most relevant to the paid tier and should be surfaced there?
