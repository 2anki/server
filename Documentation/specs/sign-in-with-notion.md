# Spec: Sign in with Notion

**Status:** Ready for implementation  
**Branch:** `feat/sign-in-with-notion`

---

## Problem

Users who arrive to convert a Notion page sign up with email/password, convert once, forget their 2anki password, and don't return. Their Notion session is the durable identity; ours is disposable. The "Connect Notion" OAuth flow already exists for Ankify and the page picker — we are reusing it as an auth source.

## Goal

Remove password friction on return visits for the Notion-first acquisition cohort. One button on login + signup, silent email-match for existing accounts, auto-register new users.

**Success metric:** First-week return-visitor rate for users whose first action was a Notion-page conversion, +3–5 pp within 30 days of launch.

---

## Scope

### In
- `GET /api/users/auth/notion/init` — initiates OAuth, redirects to Notion authorization URL with `NOTION_LOGIN_REDIRECT_URI`
- `GET /api/users/auth/notion` — unauthenticated callback; exchanges code, extracts email from `owner.user.person.email`, upserts user by email, mints JWT, saves Notion token so page picker works immediately
- `AuthenticationService.loginWithNotion(code)` — mirrors `loginWithGoogle`
- "Continue with Notion" button above "Continue with Google" on `/login` and `/register`
- `signup_origin = 'notion_oauth'` on new users for retro tracking

### Out
- Account-linking UI / merge screen
- Welcome wizard after first sign-in
- New auth-provider column on `users` (email match is the identifier, same as Google)
- Removing or deprioritising email/password or Google login
- Ankify auto-enable on login (still gates on `users.patreon`)
- Marketing landing page CTA (separate experiment)
- Apple/GitHub SSO

---

## Design

### Button placement (login + register)

```
[ Continue with Notion ]   ← NEW — above Google, outlined, Notion "N" mark
[ Continue with Google  ]   ← existing
──────── or ────────
  Email  [_________________]
  [ Continue with email  ]
```

- Button copy: **"Continue with Notion"** on both login and register screens (not "Sign in" / "Sign up" — one string, works both ways)
- Style: reuse `.googleButton` shape from `auth.module.css`; new `.notionButton` class with `currentColor` icon (Notion "N" is monochrome)
- On register only, muted line under both social buttons: _"We'll create your account using the email on your Notion profile."_
- TOS line under social buttons on register: _"By continuing with Notion or Google, you agree to our [terms] and [privacy policy]."_

### New user (first Notion sign-in)

1. User clicks Continue with Notion → Notion consent screen
2. Callback creates user: `email` from Notion profile, random UUID password hash (same as Google pattern), `signup_origin = 'notion_oauth'`
3. Notion token saved to `notion_tokens` so page picker works immediately
4. User lands on home/uploads — one-time toast: **"Welcome. Your Notion workspace is connected — pick a page to convert."** (auto-dismiss 8 s)

### Existing user (email match)

Silent login — trust Notion as the identity provider, same as Google. If a user's Notion email matches an existing 2anki account, they are logged into that account. No merge screen, no prompt.

### Error / cancel

Notion denied or failed → redirect to `/login?error=notion_cancelled`. Muted message under buttons: _"Notion sign-in was cancelled. Try again or use a different option."_

---

## Implementation plan

### Pre-requisites (Alexander to do before code lands in prod)

1. Add `https://2anki.net/api/users/auth/notion` as a second allowed redirect URI in the Notion OAuth app dashboard
2. Add `NOTION_LOGIN_REDIRECT_URI=https://2anki.net/api/users/auth/notion` to prod `.env`

For local dev: `NOTION_LOGIN_REDIRECT_URI=http://localhost:2020/api/users/auth/notion`

### Backend

**New env var:** `NOTION_LOGIN_REDIRECT_URI` — read in `NotionService` constructor alongside existing `NOTION_REDIRECT_URI`. Fail-to-boot in production if missing.

**`src/routes/UserRouter.ts`**
- `GET /api/users/auth/notion/init` — no auth required; redirects to Notion OAuth authorize URL constructed with `NOTION_LOGIN_REDIRECT_URI` and `owner=user`
- `GET /api/users/auth/notion` — no auth required; delegates to `UsersControllers.loginWithNotion`

**`src/controllers/UsersControllers.ts`**
- `loginWithNotion(req, res)` — mirror `loginWithGoogle` (lines 463–503); call `authService.loginWithNotion(code)`, set cookie, redirect to home

**`src/services/AuthenticationService.ts`**
- `loginWithNotion(code: string)` — call `NotionService.getAccessData(code)` (already exists), extract `email` and `name` from `data.owner.user.person`, upsert user by email (create if not exists with random UUID password), mint + persist JWT, also call `NotionService.connectToNotion(code, userId)` to store the workspace token

**`src/services/NotionService/NotionService.ts`**
- Add `getLoginAuthorizationLink()` — same as `getNotionAuthorizationLink()` but uses `NOTION_LOGIN_REDIRECT_URI` instead of `NOTION_REDIRECT_URI`. Keep existing method untouched.

**Existing connect flow:** `GET /api/notion/connect` and `NotionService.connectToNotion` stay completely untouched.

### Frontend

**New files:**
- `web/src/components/forms/WithNotionLink.tsx` — mirror `WithGoogleLink.tsx`; inline Notion "N" SVG, links to `/api/users/auth/notion/init`
- `web/src/styles/auth.module.css` — add `.notionButton` (copy `.googleButton`; icon uses `currentColor`)

**Edited files:**
- `web/src/pages/LoginPage/components/LoginForm/index.tsx` — insert `<WithNotionLink />` above `<WithGoogleLink />`
- `web/src/components/forms/RegisterForm.tsx` — same

### Tests

- `src/services/AuthenticationService.test.ts` — unit tests for `loginWithNotion`: happy path (new user created), email-match path (existing user returned), Notion API error path. Mock `instrumentedAxios` at the module boundary.
- `src/controllers/UsersControllers.test.ts` — controller-level test for `loginWithNotion` callback route

---

## Key files

| File | Purpose |
|---|---|
| `src/routes/UserRouter.ts` | Add two new routes (init + callback) |
| `src/controllers/UsersControllers.ts` | `loginWithNotion` controller method (mirror `loginWithGoogle` ~line 463) |
| `src/services/AuthenticationService.ts` | `loginWithNotion` service method (mirror `loginWithGoogle` ~line 161) |
| `src/services/NotionService/NotionService.ts` | `getLoginAuthorizationLink()` + `getAccessData()` already usable |
| `web/src/pages/LoginPage/components/LoginForm/index.tsx` | Add Notion button above Google |
| `web/src/components/forms/RegisterForm.tsx` | Add Notion button above Google |
| `web/src/components/forms/WithGoogleLink.tsx` | Pattern to mirror for `WithNotionLink` |
| `web/src/styles/auth.module.css` | Add `.notionButton` |
| `src/env.example` | Add `NOTION_LOGIN_REDIRECT_URI=''` |

---

## Security checklist (run `/security-review` before merge)

- [ ] Notion OAuth token exchange uses `instrumentedAxios` (already does via `getAccessData`)
- [ ] No logging of access tokens, emails, or JWT payloads in new code
- [ ] `NOTION_LOGIN_REDIRECT_URI` read from env, not hardcoded
- [ ] Callback validates `code` is present before calling `getAccessData`
- [ ] Error cases redirect cleanly — no stack traces exposed to client
- [ ] JWT minting uses existing `newJWTToken` / `persistToken` pattern unchanged

---

## Open questions

1. **Notion OAuth scope:** Confirm `owner=user` in the login authorization URL returns `owner.user.person.email` in all cases (spike: one manual token exchange against the Notion sandbox). The existing connect flow already uses `owner=user`, so this is expected to work.
2. **Toast component:** Does a toast/notification component already exist in the web workspace, or does the welcome toast need a new component?
