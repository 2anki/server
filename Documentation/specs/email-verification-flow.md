# Spec: Email Verification Flow

### Trio synthesis
- **PM:** Persistent banner driven by DB state + resend endpoint; no funnel blocking; target +15pp verified-email rate in 14 days; rate limit reuses existing magic-link infra.
- **Designer:** Four moments to fix (just-registered, returning unverified, post-verify, expired link); banner rewritten from sessionStorage to API prop; resend button with 4 states; post-verify to `/uploads?verified=1`; expired link stays in-app for authenticated users.
- **Engineer:** M effort; `AuthenticationService.getUserFrom` may not select `email_verified` — confirm before coding; `countRecentByOwner` rate limit pools across token purposes (v1 acceptable); no new migration needed.
- **Agreement:** No funnel blocking; banner driven by DB state; resend reuses magic-token + rate-limit infrastructure; post-verify feedback needed; fix expired-link redirect for authenticated users.
- **Conflict 1:** Endpoint path — resolved to `/api/users/resend-verification`. Conflict 2: sessionStorage — keep as optimistic hint in RegisterForm only; banner visibility driven by API. Conflict 3: dismiss X timing — X appears only after Resend is clicked (Designer), reducing "permanent ignore."
- **Resulting plan:** Expose `email_verified` in `getLocals`, rewrite banner to API-driven, add resend endpoint, fix post-verify and expired-link redirects.

---

## Outcome

Logged-in users with unverified email see a persistent but dismissible banner on every page until they verify. A "Resend email" button is available inline. Post-verify, users get confirmation. Expired-link errors stay in-app for authenticated users. Aligns with the 300K goal: verified emails are the substrate for every retention notification we will need to send (failed conversion alerts, deck-ready notifications, Stripe receipts).

## Problem statement

A user registers Monday, sees the session-only banner, refreshes — it's gone. Returns Wednesday, uploads, downloads a deck, never sees another prompt. Their email stays unverified forever. When "email me when my export finishes" ships, they silently miss it. Today `email_verified` is written to the DB but never read. The verification flow exists technically; the UX loop is open.

## Riskiest assumption + smallest test

**Assumption:** A persistent dismissible banner + one-tap resend moves verified-email rate materially without hurting the upload-to-download funnel.

**Smallest test:** Ship the persistent banner with `verification_banner_shown` and `verification_email_resent` events. After 14 days: if verified-email rate among new registrants doesn't rise +15pp vs. the prior cohort, escalate to a soft-prompt modal before the second upload. If upload→download conversion drops >1pp, revert the banner.

## Scope

**In:**
- Expose `email_verified: boolean` in `GET /api/users/locals` response
- Rewrite `EmailVerificationBanner` to drive visibility from `emailVerified` API prop (not sessionStorage). Banner renders on every page when logged in + `email_verified === false`
- "Resend email" button inside the banner with 4 states: idle / sending / sent / rate-limited. Session-dismissible X appears only after Resend is clicked
- `POST /api/users/resend-verification` — RequireAuthentication, rate-limited via existing `countRecentByOwner`, returns `{ ok: true }` / 429 / `{ ok: true, alreadyVerified: true }`
- Post-verify redirect changes from `/uploads` to `/uploads?verified=1`; uploads page shows one-shot success strip ("Email verified. You're all set."), auto-dismissed after 6s, param stripped via `history.replaceState`
- Expired-link redirect changes: authenticated users → `/account?verify_error=expired` with inline "Send a new one" link; unauthenticated → `/login?verify_error=expired` (existing, message copy improved)
- Account page: "Email verification" section showing status + resend action

**Out:**
- Hard-blocking any feature on `email_verified`
- Gating Notion connect or uploads (future spec if retention data warrants it)
- Per-purpose rate-limit quotas (v1 shares the 5/hour pool with magic-link logins)
- Invalidating previous unused `verify_email` tokens on resend (acceptable for v1)
- Cross-browser verify edge case (user verifies in a different browser — acceptable redirect to login for v1)

## User story + acceptance criteria

As a logged-in user who hasn't verified my email, I want a persistent reminder with a one-click resend so I can verify on my own schedule without losing access to the product.

- [ ] `GET /api/users/locals` includes `email_verified: boolean` (and `email: string` for banner display)
- [ ] `EmailVerificationBanner` shows on every page when `email_verified === false`; hides when `true`; persists across page refreshes and sessions
- [ ] Banner copy: "Verify your email so you can recover your account." / "We sent a link to {email}."
- [ ] "Resend email" button → "Sending…" → "Sent — check your inbox" (disabled 60s) → back to idle
- [ ] "Try again in a minute" when rate-limited (429)
- [ ] Dismiss X appears only after Resend is clicked; dismissal is session-scoped only
- [ ] `POST /api/users/resend-verification` returns 200 / 429 / `alreadyVerified` correctly; 401 without session
- [ ] Post-verify: redirects to `/uploads?verified=1`; success strip renders and auto-dismisses
- [ ] Expired link (authenticated): redirects to `/account?verify_error=expired` with "Send a new one" action
- [ ] `verification_banner_shown` (once/session) and `verification_email_resent` events fire
- [ ] `sessionStorage.email_verification_pending` remains as optimistic hint in RegisterForm only; not used for banner visibility
- [ ] `/check` passes

## Leading indicator

Verified-email rate among users who registered in the last 14 days. Target: +15pp vs. prior 14-day cohort. Watch: upload→download conversion must not drop >1pp.

## Design notes

**Banner layout** (flat strip above main content, no card shadow):
```
[i]  Verify your email so you can recover your account.   [Resend email]   [x after resend]
     We sent a link to alex@example.com.
```
Base: `notificationInfo` from `shared.module.css`. Drop hardcoded colors from `EmailVerificationBanner.module.css`; keep flex layout only.

**Resend button states:**
| State | Copy |
|---|---|
| Idle | `Resend email` |
| In-flight | `Sending…` (disabled) |
| Success | `Sent — check your inbox` (disabled 60s) |
| Rate-limited | `Try again in a minute` (disabled, auto-resets) |

**Post-verify strip** (uploads page, `alertSuccess`, auto-dismiss 6s): `Email verified. You're all set.`

**Expired link copy:**
- Logged in: `That verification link has expired. Links expire after 24 hours.` + `[Send a new one]` link
- Logged out: `That link expired. Log in and we'll send a new one from your account.`

**Account page:** "Email verification" section — status badge ("Verified" / "Not verified yet") + "Resend email" action when unverified.

## Technical pre-flight

**Layers touched:** routes → controllers → services → data_layer (read-only) → web

**Files in play:**
- `src/controllers/UsersControllers.ts` — add `email_verified` + `email` to `getLocals` response; add `resendVerificationEmail` handler; change `verifyEmail` redirects
- `src/services/UsersService.ts` — add `resendVerificationEmail(userId, email)` reusing token create + `sendVerificationEmail` + rate-limit check
- `src/routes/UserRouter.ts` — add `POST /api/users/resend-verification` behind `RequireAuthentication`
- `web/src/lib/backend/getUserLocals.ts` — add `email_verified?: boolean` and `email?: string` to response type (explicit field, do not rely on schema regen)
- `web/src/lib/backend/Backend.ts` — add `resendVerificationEmail()` method
- `web/src/components/EmailVerificationBanner/EmailVerificationBanner.tsx` — rewrite: accept `emailVerified: boolean`, `email: string`, `onResend: () => Promise<void>` props; drop sessionStorage read
- `web/src/components/EmailVerificationBanner/EmailVerificationBanner.module.css` — strip hardcoded blues; inherit `notificationInfo`
- `web/src/components/AppShell/SidebarLayout.tsx` + `PageLayout.tsx` — pass `email` + `emailVerified` from `getUserLocals` into banner
- `web/src/components/forms/RegisterForm.tsx` — keep sessionStorage write as optimistic hint only
- `web/src/pages/UploadPage/` — read `?verified=1`, render success strip, strip param
- `web/src/pages/AccountPage/AccountPage.tsx` — add email verification section; handle `?verify_error=expired`

**Critical pre-coding check:** Confirm `AuthenticationService.getUserFrom` selects `email_verified`. If it uses a column list that omits it, add the column there first — otherwise `getLocals` silently returns `false` for all users regardless of DB state.
```bash
grep -n "SELECT\|select\|email_verified" src/services/AuthenticationService.ts
```

**Rate limiting:** `MagicTokenRepository.countRecentByOwner` counts all token purposes in a 1-hour window (5 max). Resend shares this quota with magic-link logins in v1. Acceptable; a per-purpose overload is a follow-up if needed.

**Security:**
- Resend endpoint uses `res.locals.owner` — never `req.body` for user identity
- 429 returns a safe fixed string, not the internal `MagicLinkRateLimitError` message
- Old unused `verify_email` tokens remain valid until expiry (24h) — acceptable for v1
- No email enumeration risk: endpoint is behind `RequireAuthentication`

**Effort:** M — ~2-3h implementation, ~1-2h tests.

**Tests to add:**
- `UsersService.resendVerificationEmail`: already-verified, rate-limit, happy path (uses `InMemoryMagicTokenRepository`)
- Controller: 429 on rate limit, `alreadyVerified` shape, 200 success
- `getLocals`: assert `email_verified` in response for both verified and unverified user
- Banner: prop-driven render (`emailVerified={false}` → renders; `true` → does not). Keep existing sessionStorage test until the write is removed.

**No migration needed.** `email_verified` column already exists (migration `20260527000000`); default is `false`.
