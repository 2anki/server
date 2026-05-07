---
description: Turn recent merged PRs into a user-facing changelog entry (also seeds blog/SEO content)
argument-hint: optional date range, e.g. "last 14 days"
---

Use the `pm` agent (with help from `designer` for tone).

1. Pull merged PRs from the last $ARGUMENTS (default: 14 days). Use `gh pr list --state merged --search "merged:>=YYYY-MM-DD"`.
2. Group by user-visible category:
   - **New** — net-new features
   - **Improved** — enhancements to existing features
   - **Fixed** — bug fixes worth mentioning
   - **Behind the scenes** — perf/infra (only mention if user-perceptible)

3. Write each entry in user voice — what the user can now do, not what we changed. Bad: "Refactored Notion image extractor." Good: "Notion pages with embedded images now convert reliably even when an image fails to load."

4. Output two formats:
   - **Short** (in-app changelog modal, ~150 words)
   - **Long** (blog post draft, ~600 words, SEO-aware — title with target keyword, H2 sections, one screenshot placeholder per feature)

The blog version is the seed for distribution content. Spanish translation is a separate pass — note which entries are most worth localizing.
