# 2024-10 — Subscriber data deletion regression

**Status:** resolved (2024-10-14)
**Written:** 2026-05-15 — retrospective, based on git log + Stripe export
**Severity:** highest revenue impact incident in repo history

## What happened

In September 2024, PR #1591 (`feat: Implement worker threads for upload processing`, merged 2024-09-01) made the upload pipeline reliable for large Notion exports. The all-time peak of **472 net new paying customers** landed that month — a +44% sessions step-change overnight on Sep 2, sustained through the end of September.

Between **Sep 28 and Oct 14, 2024**, six commits landed in the deletion / cleanup path with messages including:

- `do not delete subscriptions`
- `do not delete subscriber uploads in bucket`
- `use the subscriptions table to determine is a subscriber upload`
- `add missing await call to delete calls`

Subscribers' uploads and (in some cases) subscription rows were being deleted incorrectly during routine cleanup. Users discovered that their paid content was disappearing.

## Impact

Paid signups in the affected month:

| Month | Paid signups | Sessions/day (peak) |
|---|---|---|
| Sep 2024 | **472** (all-time peak) | 559 |
| Oct 2024 | **206** (−56%) | 1029 |

Traffic *climbed* 80%+ in October. Conversion *collapsed* by more than half. The cause was almost certainly users seeing their paid uploads vanish, asking around, and either churning, refunding, or signaling caution to anyone who would have signed up via word of mouth.

## Root cause

Cleanup logic was using fragile or missing constraints to identify subscriber data:

1. **Wrong source of truth.** The fix history (`use the subscriptions table to determine is a subscriber upload`) implies cleanup was inferring subscriber status from a field other than the `subscriptions` table. Whatever field it used, it produced false negatives — paid users were classified as free and their uploads were swept.
2. **Missing await.** At least one `delete` call was firing without `await`, which means error handling wasn't running and the cleanup ran further than intended before failing.
3. **No "is this a subscriber?" guard before deletion.** The deletion path didn't make a final check; it trusted earlier filtering.

## Lessons

### 1. Reliability on the hot path is the highest-leverage product work

The Sep 2024 spike wasn't a marketing event. It wasn't a campaign. It was *worker threads on the upload pipeline*. Real organic traffic was already arriving — it just couldn't complete the job. The moment uploads stopped failing for large Notion exports, conversion followed.

**Rule:** every quarter, ship one reliability fix on the highest-bounce surface and measure the conversion delta on a daily-cohort granularity. PR #2269 (drops the legacy 300/job cap) and PR #2271 (this PR — adds the Performance tab so we can actually *see* job durations) are explicit attempts to repeat the recipe.

### 2. Broken paid experience kills conversion faster than acquisition can replace it

October had *more* traffic than September and *less than half* the paid signups. The damage propagated through word of mouth and trust — the channels we can't see in GA4. There is no top-of-funnel campaign that recovers that within the same quarter.

**Rule:** any change that touches subscriber data — uploads, downloads, subscriptions, billing — gets explicit review. The `/security-review` slash command and the `safety.py` hook both exist *because* of this incident. Treat them as load-bearing, not bureaucratic.

### 3. Code review must catch missing `await` on destructive calls

The commit `add missing await call to delete calls` shipped after 2+ weeks of revenue impact. This is the most preventable line item in this post-mortem. Modern TypeScript/ESLint can catch it (`@typescript-eslint/no-floating-promises`).

**Rule:** keep `@typescript-eslint/no-floating-promises` on `error` severity. Any explicit suppression of it in a deletion path needs a comment explaining why, and goes through `/security-review`.

### 4. Reliability fixes deserve celebration *and* instrumentation

PR #1591 was the most consequential commit in the repo's revenue history and we did not notice for 19 months. We had no dashboard that would have surfaced the job-duration improvement. We didn't run a retro on what made September different from August. The Stripe export sat unused.

**Rule:** the Performance tab shipped in this PR exists so this never happens again. Job duration percentiles are visible in real time. The signup country breakdown is visible. The slowest jobs are visible. If a future Sep 2024 happens, we will see it.

## What we'd do differently

1. **Pre-merge:** require explicit reviewer sign-off on any PR that adds or modifies a `DELETE` query, a soft-delete predicate, or a "is this a subscriber" check. Hooks already block `git push` to main; extend the policy to require human review on these specific code paths.
2. **Post-merge:** instrument deletion volume per day. Any deletion path that spikes 5x in a week should page automatically. (Not in this PR — captured as a follow-up.)
3. **Detection:** the conversion-collapse signal was visible on 2024-10-03 at the latest if we'd been watching daily paid-signup numbers against a 28-day moving average. We weren't watching.

## Open follow-ups

- Wire deletion-volume alerts to the Performance tab — out of scope for the PR that ships this doc; will be follow-up work once one week of baseline data is in the new instrumentation.
- Add an end-to-end test for the cleanup-vs-subscriber path so that "delete a subscriber's data accidentally" cannot regress silently again.
