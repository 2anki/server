## Spec: First-deck-success activation wave

### Trio synthesis

- **PM**: Activation is the funnel stage with the worst leakage today — four filed bugs/holes (#2362, #721+#731, #2352, #252) each kill a percentage of first-deck attempts. Ship them together so the wave is measurable as one activation jump, not four scattered points.
- **Designer**: The user moment is "I uploaded my notes and I don't have my deck yet." Every dead-end here is a copy or flow problem, not a visual one. The trial-on-registration single primary action and the empty-deck error rewrite carry most of the lift; onboarding popovers come last and stay skippable.
- **Engineer**: Four loosely-coupled changes, mostly in `web/`. The only server work is one new signup-with-trial atomic endpoint (or query-param flag on existing `/users/signup`). Login-loop fix is local to `LoginPage` + the cookie clear; error-copy fix is a string change + a small UI block. Onboarding is the largest unknown — recommend driver.js or a 4-step home-grown tour, not a library bake-off.
- **Agreement**: All three want the four issues shipped as one wave with one changelog entry. All three flag #252 (onboarding) as the most expandable scope and want it bounded to four popovers + Skip.
- **Conflict**: PM wanted to include a "your file is saved" affordance across the registration redirect; engineer pushed back on the storage primitive (sessionStorage vs server-side draft). Resolved by keeping the file-preserve behavior in scope but constraining the implementation to sessionStorage of the existing `limitInfo.filename` reference — re-prompt to re-attach after login, do not server-side-stash binary uploads.
- **Resulting plan**: Four changes, one PR per change, merged in order: empty-deck copy → login-loop fix → trial-on-registration → onboarding. The wave ships under one changelog entry once all four are in main.

---

**Outcome**: Lift first-deck-success rate (anonymous visit → downloaded `.apkg`) measurably. Target: +5 percentage points across the four sub-flows combined, measured over the 14 days after the last of the four merges. Leading indicators that should move: anonymous-upload-to-registration conversion (#2362), conversion-success rate for users who upload an empty Notion export (#721+#731), returning-user login success (#2352), and 7-day retention for new accounts (#252).

**Goal alignment**: Activation is the funnel stage that compounds hardest against the 300K-user goal — every dead-end in the first 30 seconds costs a user we already paid to acquire. Four filed, reproducible dead-ends fixed together is the cheapest activation win on the board.

**Problem**: A new visitor arrives, uploads their notes, and hits one of four cliffs: (a) anonymous user hits the 100-card limit, registers, immediately hits the same limit again because the 1-hour trial CTA is only shown post-registration (#2362); (b) the upload converts but produces no cards, and the user sees "Could not create any cards. Did you write any togglelists?" — a hostile string referencing an internal concept (#721, #731); (c) a returning user with a stale or invalidated session cookie lands in an infinite redirect loop between `/upload` and `/login`, looking like the site is down (#2352); (d) a new account-holder reaches the upload page with no orientation and gives up because they don't know where to start (#252). Each cliff is independent — fixing one doesn't fix the others — and they compound.

**Riskiest assumption**: That activation lifts compound across the four fixes — i.e. that the user who would have bounced at the limit-screen dead-end is *also* the same user who would have bounced at the empty-deck error, the login loop, or the unguided upload screen. If the cliffs hit non-overlapping user segments, the combined lift is the sum of four small numbers, not one big one. Either way the work is worth doing, but the wave framing assumes leverage.

**Smallest test**: Before any UI work, instrument the existing four touchpoints with a one-line analytics event each (already partially in place for upload + register). Run for one week, count drop-off at each step, confirm the four points are in fact the top-four leak points. If a fifth, larger leak shows up (e.g. checkout, OAuth callback) the wave reprioritises.

**Scope (in)**:
- #2362 — anonymous trial-on-registration: single primary CTA "Create account + start 1-hour trial" on the anonymous limit screen, atomic signup-then-startTrial on the server, file reference preserved across the redirect via sessionStorage.
- #721 + #731 — replace the "Could not create any cards. Did you write any togglelists?" string with copy that names the surface, gives a next step, and points at `/documentation/help/common-problems` for the deeper case (the docs page already covers it).
- #2352 — `/login` distinguishes "no cookie" from "invalid cookie": invalid cookie is cleared on render, login form renders once, no further redirect. Add a vitest + Playwright case for the malformed-JWT path.
- #252 — four-step popover tour on first authenticated visit to `/upload`: "Drop a file or pick Notion" → "Pick your deck settings" → "Convert" → "Download or send to AnkiWeb". A persistent **Skip** button on every step. Stored on the user row, not localStorage, so it doesn't reappear on a new device.

**Scope (out)**:
- Showing the trial CTA on any limit screen other than the upload-limit message (paywall banner, top message). Handle in a follow-up if needed.
- Paid pass upsell at the limit screen. Separate question.
- A user-facing "You were signed out" notice on the login-loop fix. Nice to have, file separately.
- Detecting *why* the cookie is invalid (rotation, tampering, expiry). Treat all invalid cookies the same.
- Onboarding for surfaces other than `/upload` (downloads, settings, account). The first deck is the only thing that matters for activation.
- Bet 5's Note.ts dedupe work — left untouched.

**User story**: As a new visitor who just uploaded my notes, I want to land on a downloaded Anki deck within 30 seconds, even when the first thing I tried hit a limit, returned no cards, or my old session expired — without having to read documentation, contact support, or guess what "togglelist" means.

**Acceptance criteria**:

#2362 — Trial on registration
- [ ] Anonymous upload-limit screen shows one primary CTA: "Create account and start trial" (sentence case, no exclamation, no "my").
- [ ] CTA links to `/register?redirect=/upload&start_trial=1`.
- [ ] On registration with `start_trial=1`, the server atomically creates the account and starts the trial — one request, one cookie set, no second click required.
- [ ] If the registering email already had `trial_started_at != null` (e.g. previously-deleted account being recreated), the CTA falls back to "Create account" silently — don't promise a trial we won't give.
- [ ] The originally-uploaded filename is preserved across the redirect (sessionStorage), and a one-line banner on the post-register `/upload` page reads "Re-attach <filename> to convert."
- [ ] If the user navigates away from `/register` without completing, the sessionStorage reference is left intact for the session; cleared on next successful upload.

#721 + #731 — Empty-deck error copy
- [ ] The string "Could not create any cards. Did you write any togglelists?" is removed from every code path.
- [ ] Replacement copy, surfaced where the old one was: **"No cards were found in this file. Most files need a toggle-list (Notion) or a question/answer pair to become cards. See common problems for the formats that work."** — link "common problems" to `/documentation/help/common-problems`.
- [ ] When the failure is an outright conversion error (not "zero cards"), the message becomes **"Something broke while reading this file. Try again, or send the file to support@2anki.net so we can fix the parser."** (#731).
- [ ] Both messages render as the contents of an info card, not a toast. They persist on the page until the user retries.
- [ ] Vitest covers both strings rendering in the relevant states.

#2352 — Login-loop fix
- [ ] Visiting any protected route with a malformed or expired session cookie bounces to `/login` exactly once. The cookie is cleared on that render.
- [ ] Visiting `/login` with no cookie renders the form once with no redirect.
- [ ] The guard distinguishes "no cookie" (render) from "invalid cookie" (clear + render) — not by presence alone.
- [ ] Vitest covers the cookie-cleared path; Playwright covers the malformed-JWT loop-prevention scenario.

#252 — First-upload onboarding
- [ ] A four-step popover tour appears on a user's first authenticated visit to `/upload`.
- [ ] Each step has a **Skip** button (not "Dismiss", not "Close"); pressing Skip flags the user as onboarded for all future visits.
- [ ] The tour does not appear for users with `created_at` more than 24 hours before the feature ships (i.e. don't re-onboard existing users).
- [ ] The onboarded flag is stored on the user row, not localStorage. New migration: `users.onboarded_at TIMESTAMPTZ NULL`.
- [ ] On a fresh device, an already-onboarded user does not see the tour.
- [ ] Step copy follows VOICE.md: imperative, sentence case, no exclamation marks, no "Let's get started", no fake warmth.

**Cross-cutting**:
- [ ] One changelog entry for the wave, written after the last PR merges. Draft: **"First upload is smoother — clearer error when a file has no cards, a single button to create your account and start your trial, and a quick tour on your first visit."** (revise to match `changelog.ts` on the day; one line, no period, sentence case, no banned words.)
- [ ] `pnpm test`, `pnpm --filter 2anki-web test`, `pnpm --filter 2anki-web typecheck`, and `pnpm --filter 2anki-web lint` all clean before each PR ships.

**Open questions**:
1. **Trial-on-registration atomicity**: should it be a new `/users/signup-with-trial` endpoint, or a `start_trial=1` flag on the existing signup? Engineer leans to the flag — fewer routes, less surface area to test. PM doesn't care as long as it's one request.
2. **Empty-deck vs conversion-error distinction**: today the upload path returns the same shape for "0 cards" and "parser threw". Does the parser already differentiate at the boundary, or does engineer need to add a discriminator? Confirm before writing the copy.
3. **Onboarding library vs hand-rolled**: driver.js is the obvious pick (small, framework-agnostic) but adds a dep. Hand-rolled four-step is ~150 LOC and zero deps. Pick before starting.
4. **Sessionstorage filename preserve**: is it safe to assume `limitInfo.filename` is non-PII enough to keep in sessionStorage? It's a user-chosen filename — should be fine, but flag for review.
5. **#2352 root cause**: the issue body lists `SECRET` rotation, OAuth client rotation, and CSP regression (#2306/#2307) as triggers. Confirm none of these recur with the fix in place — the loop guard is the symptom-level fix, not the root cause.

**Out of scope (next iteration)**:
- Server-side draft storage of uploaded files across login (today the file is re-prompted; binary draft persistence is a separate feature).
- A "Continue with Google" / "Continue with Notion" path on the trial-on-registration CTA — the wave keeps the existing register form for now.
- Re-running the onboarding tour on demand (a `/onboarding` page or "Show me the tour again" link). File separately if anyone asks.
- Localised copy for the empty-deck error and onboarding steps. English only for the first ship.
- Expanding onboarding to the downloads page, account page, or Anki Sync page. First deck only.

---

### Design notes

**The user moment.** Every fix targets the same instant — "I uploaded my notes and I don't have my deck yet." The user is task-focused, not exploring; the right response is a single primary action that names what they get.

**One primary action per dead-end.** All four screens collapse to one CTA, no "or" buttons, no equal-weight secondaries:

| Screen | Primary CTA | Notes |
|---|---|---|
| Anonymous upload limit | **Create account and start trial** | Sentence case. No "my". The "1-hour" qualifier moves into the helper line below ("Convert any file for the next hour."), not the button. |
| Empty-deck error | **Read common problems** | Secondary "Try a different file" as a link, not a button. |
| Login loop fixed | (no new CTA — the existing **Log in** button is what they want; the fix is that they see it.) | Optional small text: "Your session ended. Sign in to continue." — flagged as out-of-scope. |
| First-upload tour | **Next** / **Skip** on every step | Skip is a text button to the right of Next, same weight as the close X — visible, not hidden. |

**Copy strings (subject to VOICE.md, sentence case, no period on button labels, no banned words):**

- Limit screen primary: **Create account and start trial**
- Limit screen helper line: **Convert any file for the next hour.**
- Limit screen fallback (trial already used): **Create account**
- Empty-deck info card: **No cards were found in this file. Most files need a toggle-list (Notion) or a question/answer pair to become cards. See common problems for the formats that work.**
- Conversion-error info card: **Something broke while reading this file. Try again, or send the file to support@2anki.net so we can fix the parser.**
- Tour step 1: **Drop a file, or pick a Notion page.** — supported formats listed under.
- Tour step 2: **Pick deck settings.** — short line.
- Tour step 3: **Convert your file into a deck.**
- Tour step 4: **Download the deck, or send it to AnkiWeb.**
- Tour controls: **Next**, **Back**, **Skip** (no "Dismiss", no "Got it!", no exclamation marks).

**Empty-state vs error-state.** The empty-deck info card is *not* a toast — it persists in place of the result. The trial-on-registration banner on the post-login `/upload` ("Re-attach <filename> to convert.") *is* persistent until the file is re-uploaded; it's not dismissible because the dismiss action would lose state with no recovery.

**Visual restraint.** No new colors, no new icons specifically for this wave. Use existing info-card and primary-button tokens. Onboarding popover uses the existing card surface and the primary button — no themed tooltip styling.

**Verdict**: no scope changes to the pm spec. Copy and primary-action choices above are the design contribution.

---

### Technical pre-flight

**Layers touched**:
- `web/` — most of the work (upload form CTAs, empty-deck info card, login redirect guard, onboarding tour).
- `src/routes/UserRouter.ts` + `src/controllers/UsersControllers.ts` — extend the existing signup handler to accept and honor `start_trial=1`; verify `startTrial` is idempotent. No new route preferred.
- `src/data_layer/` — one migration for `users.onboarded_at TIMESTAMPTZ NULL`. Regenerate types with `pnpm kanel`.
- No changes in `src/services/` or `src/lib/parser/` — the empty-deck case already reaches the boundary; we're rewriting the message, not the detection.

**Files likely in play**:
- `web/src/pages/UploadPage/components/UploadForm/UploadForm.tsx` (lines 259, 733–757, 927, 954 — the existing `showTrialButton`/`limitInfo` logic). Simplify the anonymous branch to a single CTA.
- `web/src/pages/UploadPage/components/UploadForm/UploadForm.test.tsx` — adjust the 6+ tests that pin the current two-CTA shape.
- `web/src/components/forms/RegisterForm.tsx` — read `start_trial` query param, forward to backend.
- `web/src/pages/LoginPage/components/LoginForm/helpers/useHandleLoginSubmit.ts` and `web/src/pages/LoginPage/LoginPage.tsx` — invalid-cookie distinguish + clear logic.
- `web/src/lib/backend/api.ts` — `redirectToLogin` currently checks pathname; extend to handle the invalid-cookie clear path, or add a sibling helper.
- `web/src/pages/DocsPage/content/help/common-problems.md` — already covers the empty-deck case; verify the deep link.
- New: `web/src/pages/UploadPage/components/OnboardingTour/` — four-step popover + Skip + `onboarded_at` PATCH.
- `src/controllers/UsersControllers.ts` — `signup` path: accept `start_trial`, call `startTrial` in the same request after the user row + auth cookie are committed. Wrap both in a transaction or run sequentially with a rollback path on the trial-start failure (engineer recommends sequential + log on trial-start failure; account creation is the more valuable side effect, don't fail the signup if trial start fails).
- `src/routes/UserRouter.ts` — endpoint to PATCH `users.onboarded_at`.
- New migration: `migrations/<timestamp>_user_onboarded_at.js` via `npx knex migrate:make user_onboarded_at --knexfile ./src/KnexConfig.ts --migrations-directory ../migrations -x js`, then `pnpm kanel`.

**Cross-language coordination**: None. All TypeScript both sides.

**Estimated effort**:
- #721+#731 — **S**. String change in 1–2 files, 2 new test cases, copy review.
- #2352 — **S**. Local to `LoginPage` + `api.ts`; one vitest, one Playwright.
- #2362 — **M**. Server-side change to signup, sessionStorage glue, register-form query param plumbing, 3+ test updates, security review for the `start_trial` flag (must verify the signup path can't be tricked into starting a trial without an actual sign-up).
- #252 — **M**. New component, migration, kanel regen, 2 endpoints (read + PATCH), 4 vitest cases, 1 Playwright covering the Skip path.

Wave total: **M+**. Recommend four PRs, smallest first (copy → login-loop → trial-on-reg → onboarding), each off the freshly-updated `main`.

**Security**:
- `start_trial=1` query param must only take effect inside the same atomic signup request — never on an arbitrary "start my trial" GET. The existing `startTrial` controller already gates on auth — confirm there's no path where an attacker can pass `start_trial=1` on someone else's signup. CWE-862 to verify.
- Onboarded-at PATCH endpoint must require auth and only allow the authenticated user to update their own row (no `userId` in the body — pull from `res.locals`). CWE-639.
- SessionStorage filename: it's user-chosen text; render any banner that displays it through the existing safe-rendering pipeline. No HTML interpolation. CWE-79.
- Login-loop clear path must use `Set-Cookie` with `HttpOnly; Secure; SameSite=Lax; Max-Age=0` exactly matching the original cookie attributes — wrong attributes can fail to clear in some browsers and re-trigger the loop the fix is supposed to remove. CWE-614.

**Testing**:
- Outside-in: drive every test from the form/page boundary, not the internal hooks. Per `.claude/rules/testing.md`, mock only HTTP at the SDK boundary.
- Failing-test-first for the login-loop fix — reproduce the loop in vitest before fixing.
- Empty-deck error: two `it.each` cases for the two messages.
- Onboarding: cover both first-time-render and already-onboarded-don't-render paths.

**Migrations**:
- One: `users.onboarded_at TIMESTAMPTZ NULL`, default null. Backfill: leave null (existing users don't see the tour because the front-end gates on `created_at` window, not on `onboarded_at`).
- Regenerate types with `pnpm kanel`. Do not hand-edit `src/data_layer/public/`.

**Sonar**:
- Trial-on-registration handler will likely trip cognitive-complexity if the signup path grows another conditional. Plan to factor the "with-trial" tail into a small helper before pushing.
- The new login-guard branch must lead with the positive ("if (cookie && valid)") per Sonar S7735.
- Run `sonar-scanner` locally before each `gh pr ready`.

**Out of scope (engineering)**:
- A retry-this-file affordance after the empty-deck error (would require keeping the upload in temp storage past the response — separate spec).
- A graceful in-tab toast for the login-loop "you were signed out" message (would couple front-end auth state to the cookie clear timing — defer).
