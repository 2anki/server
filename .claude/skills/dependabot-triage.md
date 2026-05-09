---
description: Classify open dependabot PRs, auto-merge safe greens, hold + comment on the rest
allowed-tools: Bash
model: sonnet
---

Triage open dependabot PRs against this repo's dependency rules (`.claude/rules/dependencies.md`). Goal: clear the queue without staring at every diff.

## Process

1. **List open dependabot PRs** with the data needed to classify each:

   ```
   gh pr list --search "author:app/dependabot is:open" --json number,title,headRefName,labels,statusCheckRollup,additions,deletions,url,body
   ```

2. **Classify each PR.** A PR is **needs-eyes** (do NOT auto-merge) if ANY of these are true:

   - **Major bump** — title contains `from <X>.x.x to <Y>.x.x` where `Y > X`. Dependabot also labels these `version-update:semver-major`.
   - **Pinned override** — touches a package listed in `pnpm.overrides` (`package.json`):
     `path-to-regexp`, `picomatch`, `rollup`, `yaml`, `@types/express`, `@types/express-serve-static-core`. Bumping these can silently re-open a CVE we've worked around.
   - **Built dependency** — touches anything in `pnpm.onlyBuiltDependencies` (currently `better-sqlite3`). Build-step deps need a manual smoke run.
   - **Security-sensitive surface** — touches `bcryptjs`, `jsonwebtoken`, `sanitize-html`, `multer`, `express`, `stripe`, `@notionhq/client`, `@anthropic-ai/sdk`, `@sendgrid/mail`, `axios`, `knex`, or anything matching `node-*`. Even minors here get a manual look.
   - **Checks not green** — `statusCheckRollup` has any entry with `conclusion` ∉ {`SUCCESS`, `NEUTRAL`, `SKIPPED`} (treat in-progress as not-green; come back later).

   Otherwise it is **safe** — patch/minor on a non-sensitive dep with all checks green.

3. **Auto-merge the safe ones.** For each safe PR:

   ```
   gh pr merge <number> --squash --auto --delete-branch
   ```

   `--auto` is safe alongside the `check-merge-status.py` hook: if anything red lands later, GitHub holds the merge.

4. **Hold the needs-eyes ones with a one-line comment** linking the upstream changelog so the next reviewer can decide in 30 seconds:

   ```
   gh pr comment <number> --body "Held for manual review (<reason>). Changelog: <url>"
   ```

   The changelog URL is usually in the PR body under "Release notes" or "Commits" — extract the GitHub release link if present, otherwise the repo's releases page.

5. **Print a summary**, grouped:

   ```
   Auto-merged (N):
     - #<num> <title>
   Held (M):
     - #<num> <title> — <reason>
   ```

## Rules

- **Never** bypass the queue with `gh pr merge --admin`. The check-merge-status hook is the gate.
- **Never** rebase or push to the dependabot branch yourself — comment `@dependabot rebase` if needed; the bot owns the branch.
- **Never** close a held PR without merging. The dependabot workflow expects merge or label, not close (`.claude/rules/dependencies.md`).
- **Do not** read or edit `pnpm-lock.yaml` directly. If a held major needs lockfile attention, surface it for manual `pnpm install`.

## When held majors pile up

If five or more held PRs accumulate, surface the list to Al with the upgrade impact (transitive bloat via `pnpm why`, breaking-change notes from the changelog) so a batch decision can be made. Do not start auto-upgrading majors.
