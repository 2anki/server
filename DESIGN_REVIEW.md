# Design Review — Phase A

Code-based audit of every user-facing surface in the 2anki frontend and
server-generated HTML. Scored against the 12-question excellence rubric.

> **Note:** This review is a code-level analysis — CSS, component structure,
> state handling, token usage. Screenshots were not captured (CLI environment).
> Scoring reflects structural quality; a visual pass in-browser is recommended
> before Phase B implementation.

---

## 1. Executive Summary

**Overall state:** The design system is solid — a well-organized token scale
(spacing, type, color, shadow, radius) with four complete themes. Most surfaces
use tokens correctly. The voice sweep landed clean copy. State handling is
thoughtful on high-traffic pages (Import, Downloads, Search) but thin on
secondary pages.

**Top three themes:**

1. **Token leakage** — PricingPage, DocsPage, AnkifyPage, and UploadForm use
   hardcoded values (transitions, shadows, colors) that duplicate or conflict
   with the token system. Eleven occurrences of `0.15s ease` when the token
   `--transition-fast` is literally `150ms ease`.

2. **State completeness gap** — Only Downloads has a designed empty state
   component. Other pages handle emptiness inline or not at all. Loading states
   vary between skeleton, spinner, and raw text.

3. **Structural value duplication** — `max-width: 960px`, spinner animation,
   and `rgba(0,0,0,0.5)` backdrop appear in 2–3 files each. No single source
   of truth for these recurring values.

**Three things working exceptionally well:**

- **Theme system** — Four complete themes with full semantic token coverage.
  Switching themes is noticeable across every page. Gold and purple themes
  have considered shadow tinting.
- **Auth flow design** — `auth.module.css` is the cleanest file in the
  project: every value tokenized, generous spacing, clear hierarchy.
- **PricingPage craft** — Despite token leakage, the card animations, Fraunces
  typography, and tier differentiation show genuine design thought.

**Three things consistently weakest:**

- **Email templates** — Server-generated HTML with no design tokens, inline
  styles, and no dark mode support. The most neglected surfaces.
- **Secondary page states** — ContactPage, AboutPage, ForgotPasswordPage
  have no loading, error, or empty state handling.
- **Transition consistency** — Three different patterns: `0.15s ease`,
  `var(--transition-fast)`, and `200ms ease`. All meaning the same thing.

---

## 2. Cross-Cutting Findings

### F1: Transition values are fragmented

Eleven files use hardcoded `0.15s ease` or `200ms ease` instead of
`var(--transition-fast)` (which is `150ms ease`). Some files mix both.

**Files:** UploadForm.module.css (×5), DownloadsPage.module.css (×8),
ImportPage.module.css (×2), PricingPage.module.css (×8, using `200ms`/`240ms`),
StepIndicator.module.css (×1).

**Fix:** Replace all with `var(--transition-fast)`. For the few intentionally
slower transitions (card hover, drawer slide), add `--transition-normal: 250ms ease`
to the token scale.

### F2: Backdrop color not tokenized

`rgba(0, 0, 0, 0.5)` appears in shared.module.css (modal backdrop),
AppShell.module.css (mobile drawer backdrop), and DocsPage.module.css
(drawer backdrop).

**Fix:** Add `--color-backdrop: rgba(0, 0, 0, 0.5)` to `:root` and dark
theme overrides. Use it everywhere.

### F3: Border-radius `50%` vs `var(--radius-full)`

Four files use `50%` for circular elements (spinners, avatars, step numbers)
instead of `var(--radius-full)` which is `9999px`. PricingPage uses both
`9999px` and `999px`.

**Fix:** Standardize all circles to `var(--radius-full)`.

### F4: Max-width duplication

`960px` appears in shared.module.css (`.page`), DownloadsPage.module.css,
and Skeleton.module.css. `720px` and `540px` also repeat across files.

**Fix:** Add `--content-max-width: 960px`, `--content-narrow: 540px` to
the token scale. Or compose from the shared `.page` class.

### F5: Spinner animation duplicated

Identical spinner keyframes and styles appear in shared.module.css and
DownloadsPage.module.css. Both define a 48px/16px spinner with `0.8s`
rotation.

**Fix:** Use the shared `.spinner` / `.spinnerSmall` classes everywhere.
Remove duplicate definitions.

### F6: Focus ring inconsistency

shared.module.css line 965 uses `rgba(99, 102, 241, 0.15)` for select
focus rings — a hardcoded indigo that doesn't respond to theme changes.
The token `--color-focus-ring` exists and theme-adapts.

**Fix:** Replace with `var(--color-focus-ring)`.

### F7: Hardcoded code block colors in DocsPage

`pre` blocks use hardcoded `#0b1020` background and `#e5e7eb` text. The
copy button uses `rgba(255,255,255,0.08)`. These don't respond to theme.

**Fix:** Add `--color-code-bg` and `--color-code-text` tokens to `:root`
and theme overrides. In light/gold themes, a near-black code block is fine.
In dark theme, something slightly lighter. In purple theme, a deep purple.

### F8: Empty state design is inconsistent

Only DownloadsPage has a dedicated `EmptyDownloadsSection` component.
PreviewPage shows "This page has no blocks to preview." as plain text.
Search/Notion shows a ConnectNotion card. Favorites redirects on error.

**Fix:** Create a shared `EmptyState` component with icon, title,
description, and optional CTA. Use it on Downloads, Preview, Favorites,
and the card-options page.

### F9: Loading state vocabulary varies

Three different loading patterns: `SkeletonList`/`SkeletonPage` (best),
raw `<div>` with spinner class, and inline text ("Loading...").

**Fix:** Standardize on Skeleton components. Reserve spinner for in-button
loading states only.

### F10: Sidebar spacing uses hardcoded px

AppShell.module.css uses `10px`, `8px 12px`, `20px`, `4px` for gaps and
padding instead of `--space-*` tokens. Font weights `400`/`500` instead
of `var(--font-normal)` / `var(--font-medium)`.

**Fix:** Replace with token equivalents from the spacing scale.

---

## 3. Per-Surface Review

Scoring key: each question 1–5, total /60.
Bands: 55–60 ship, 45–54 minor polish, 35–44 themed pass, <35 rethink.

### 3.1 Landing Page (`/`, `/notion-to-anki`, etc.)

**Files:** `LandingPage.tsx`, `LandingPage.module.css`

| # | Question | Score | Notes |
|---|----------|-------|-------|
| 1 | Primary action obvious? | 5 | Upload drop zone is the hero. Clear CTA. |
| 2 | Hierarchy clear? | 4 | Title → subtitle → upload → how it works. FAQ at bottom. |
| 3 | System data in user language? | 5 | File types listed plainly. |
| 4 | Destructive styles reserved? | 5 | No destructive actions on this page. |
| 5 | Whitespace generous? | 4 | Good padding. Mobile padding drops to 1rem which is tight. |
| 6 | Borders earning their place? | 5 | FAQ dividers serve purpose. Minimal borders. |
| 7 | Rhythm consistent? | 4 | Sections use consistent spacing. Hero/section gap could be tighter. |
| 8 | Style consistency? | 4 | All tokens used. UploadForm transition hardcoded. |
| 9 | Detail craft? | 3 | FAQ +/− markers are plain text. Step numbers are tokenized. |
| 10 | State completeness? | 3 | No loading/error states — it's static, but upload form has them. |
| 11 | Motion intent? | 3 | No motion on this page. Not needed, but no considered transitions. |
| 12 | Considered moment? | 3 | Step numbers using primary color. No standout moment. |

**Total: 48/60 — Minor polish**

**Findings:**
- UploadForm.module.css has 5 hardcoded `0.15s ease` transitions
- Mobile hero padding (2rem 1rem) is tight; 1.25rem edge padding would
  be more generous
- FAQ could use smooth open/close transition

---

### 3.2 Upload Page (`/upload`)

**Files:** `UploadPage.tsx`, `UploadForm.module.css`, `SettingsModal.module.css`

| # | Question | Score | Notes |
|---|----------|-------|-------|
| 1 | Primary action obvious? | 5 | Drop zone is the page. |
| 2 | Hierarchy clear? | 4 | Title → drop zone → hints. Settings icon appears after interaction. |
| 3 | System data in user language? | 5 | File types plainly listed. |
| 4 | Destructive styles reserved? | 5 | N/A. |
| 5 | Whitespace generous? | 4 | Drop zone has good padding. |
| 6 | Borders earning their place? | 5 | Dashed border communicates drop target. |
| 7 | Rhythm consistent? | 4 | `smallDescription` paragraphs evenly spaced. |
| 8 | Style consistency? | 3 | 5 hardcoded transitions. `convertButton` and `downloadButton` define similar styles separately. |
| 9 | Detail craft? | 3 | Validation states (warning, error) on drop zone are well done. |
| 10 | State completeness? | 4 | Idle, active (dragging), warning, error, ready states all designed. |
| 11 | Motion intent? | 2 | Only border-color/bg transition on hover. No upload progress animation. |
| 12 | Considered moment? | 3 | Drop zone color change on drag is functional, not delightful. |

**Total: 47/60 — Minor polish**

**Findings:**
- Five `0.15s ease` should be `var(--transition-fast)`
- `convertButton` and `downloadButton` share most properties — could
  compose from shared `.btnPrimary`
- No progress indicator during upload (handled by Import page instead)
- `downloadButtonReady` success state is a nice touch

---

### 3.3 Downloads Page (`/downloads`)

**Files:** `DownloadsPage.tsx`, `DownloadsPage.module.css`, `ListJobs.css`,
`EmptyDownloadsSection.tsx`, `PaywallBanner.module.css`, `StatusTag.tsx`

| # | Question | Score | Notes |
|---|----------|-------|-------|
| 1 | Primary action obvious? | 4 | Download buttons are clear. Refresh button secondary. |
| 2 | Hierarchy clear? | 4 | Sections (active/failed/finished) well separated. |
| 3 | System data in user language? | 4 | Job statuses are user-friendly. |
| 4 | Destructive styles reserved? | 5 | Only delete uses danger styles. |
| 5 | Whitespace generous? | 4 | Table padding good. |
| 6 | Borders earning their place? | 4 | Section separators serve grouping purpose. |
| 7 | Rhythm consistent? | 3 | Table uses px padding (12px 16px) while rest uses rem. |
| 8 | Style consistency? | 3 | 8 hardcoded `0.15s ease` transitions. Spinner duplicated. ListJobs.css is a non-module CSS file (global classes). |
| 9 | Detail craft? | 3 | StatusTag dot+text pattern is clean. |
| 10 | State completeness? | 5 | Skeleton loading, empty state, error redirect, paywall banner. Best in the app. |
| 11 | Motion intent? | 2 | Only hover transitions. |
| 12 | Considered moment? | 4 | EmptyDownloadsSection with icon, title, description, CTA is well done. |

**Total: 45/60 — Minor polish**

**Findings:**
- `ListJobs.css` is a non-module file with global classes (`.stripe-status-*`).
  Should migrate to CSS modules
- Table padding in px while surrounding layout uses rem
- Eight hardcoded transitions
- Spinner CSS duplicated from shared.module.css

---

### 3.4 Import Page (`/import`)

**Files:** `ImportPage.tsx`, `ImportPage.module.css`, `StepIndicator/`

| # | Question | Score | Notes |
|---|----------|-------|-------|
| 1 | Primary action obvious? | 4 | Import button clear. Multi-state makes it complex. |
| 2 | Hierarchy clear? | 4 | State machine drives appropriate view per phase. |
| 3 | System data in user language? | 4 | Status messages are human. |
| 4 | Destructive styles reserved? | 5 | N/A. |
| 5 | Whitespace generous? | 4 | Good spacing. |
| 6 | Borders earning their place? | 4 | Step indicator separators serve grouping. |
| 7 | Rhythm consistent? | 4 | Consistent spacing within each state view. |
| 8 | Style consistency? | 3 | Two hardcoded transitions (0.15s and 0.3s). 8px progress bar height hardcoded. |
| 9 | Detail craft? | 4 | Step indicator with active dot pulse is polished. |
| 10 | State completeness? | 5 | All 5 phases designed: idle, uploading, polling, completed, failed. |
| 11 | Motion intent? | 4 | Active step dot pulses. Progress bar animates. `prefers-reduced-motion` respected. |
| 12 | Considered moment? | 4 | Pulsing dot on active step. Step progression feels alive. |

**Total: 49/60 — Minor polish**

**Findings:**
- Two hardcoded transition values
- `pagePickerList` has `2px` gap (no token match)
- Progress bar height `8px` is hardcoded — could add `--progress-height` if reused

---

### 3.5 Search/Notion Page (`/notion`)

**Files:** `SearchPage.tsx`, `SearchPage.module.css`, `SearchObjectEntry/`

| # | Question | Score | Notes |
|---|----------|-------|-------|
| 1 | Primary action obvious? | 5 | Search input dominates. |
| 2 | Hierarchy clear? | 5 | Search bar → results. Clean information hierarchy. |
| 3 | System data in user language? | 4 | "Searching..." with animated dots. |
| 4 | Destructive styles reserved? | 5 | N/A. |
| 5 | Whitespace generous? | 5 | Sticky search bar, generous padding. |
| 6 | Borders earning their place? | 5 | Only a bottom border on search input. Minimal. |
| 7 | Rhythm consistent? | 5 | Clean, uniform spacing. |
| 8 | Style consistency? | 4 | Most tokens used. `6px` dot size hardcoded. |
| 9 | Detail craft? | 4 | Large search input is a deliberate design choice. Searching dots animate. |
| 10 | State completeness? | 4 | Skeleton loading, error with retry, connected/not-connected states. |
| 11 | Motion intent? | 4 | Searching indicator fades in. Dot pulses. |
| 12 | Considered moment? | 5 | The oversized search input with bottom-border-only feels like a statement. |

**Total: 55/60 — Ship as-is, exemplary**

**Findings:**
- Minor: `6px` hardcoded dot dimensions
- One of the best-designed surfaces in the app

---

### 3.6 Preview Pages (`/preview/:id`, `/preview/apkg/:key`)

**Files:** `PreviewPage.tsx`, `PreviewPage.module.css`, `PreviewApkgPage.tsx`

| # | Question | Score | Notes |
|---|----------|-------|-------|
| 1 | Primary action obvious? | 4 | Content preview is the focus. Actions row for download. |
| 2 | Hierarchy clear? | 4 | Back link → content → actions. |
| 3 | System data in user language? | 4 | "Loading more…", "This page has no blocks to preview." |
| 4 | Destructive styles reserved? | 5 | N/A. |
| 5 | Whitespace generous? | 4 | Preview card has generous padding. |
| 6 | Borders earning their place? | 4 | Toggle children border-left serves nesting indication. |
| 7 | Rhythm consistent? | 4 | Consistent spacing between content blocks. |
| 8 | Style consistency? | 4 | Good token usage throughout. |
| 9 | Detail craft? | 3 | Infinite scroll sentinel is invisible (1px). Loading row centered. |
| 10 | State completeness? | 4 | Skeleton loading, empty state text, error with retry, pagination loading. |
| 11 | Motion intent? | 2 | No meaningful motion. |
| 12 | Considered moment? | 3 | Toggle blocks with border-left nesting is functional but not delightful. |

**Total: 45/60 — Minor polish**

**Findings:**
- Empty state is plain text, not the designed `EmptyState` pattern
- No deck-switcher animation on APKG preview
- `retryButton` inline underline style is clean

---

### 3.7 Pricing Page (`/pricing`)

**Files:** `PricingPage.tsx`, `PricingPage.module.css`

| # | Question | Score | Notes |
|---|----------|-------|-------|
| 1 | Primary action obvious? | 5 | Pro card elevated, badge "Best for most". |
| 2 | Hierarchy clear? | 5 | Three tiers with clear visual differentiation. |
| 3 | System data in user language? | 5 | Prices, benefits, CTA text all human. |
| 4 | Destructive styles reserved? | 5 | N/A. |
| 5 | Whitespace generous? | 5 | Cards breathe. Good header/content/footer spacing. |
| 6 | Borders earning their place? | 5 | Pro border with color, Lifetime warm tint, Hosted dashed. |
| 7 | Rhythm consistent? | 4 | Card internals consistent. Header→body→footer rhythm is uniform. |
| 8 | Style consistency? | 2 | Most hardcoded values in the app: 8 custom transitions (200ms, 240ms, 600ms), 5 custom shadows with raw rgba, custom font sizes (2.85rem, 0.95rem, 0.78rem, 0.6875rem). |
| 9 | Detail craft? | 5 | Fraunces font, infinity symbol badge, pulsing waitlist dot, arrow animation on CTA hover, staggered card entrance. This is the most crafted surface. |
| 10 | State completeness? | 4 | Waitlist button has idle/pending/sent/error states. |
| 11 | Motion intent? | 5 | Card fade-in with stagger, Pro card elevation, CTA arrow slide, pulsing dot. `prefers-reduced-motion` respected. |
| 12 | Considered moment? | 5 | The elevated Pro card with glow, the ∞ badge on Lifetime, the dashed border with dot pattern on Hosted Anki. Multiple considered moments. |

**Total: 55/60 — Ship as-is, exemplary**

**Findings:**
- Highest craft level in the app, but also highest token debt
- 8 hardcoded transition values (200ms, 240ms, 220ms, 600ms, 2.6s, 2.2s)
- 5 hardcoded shadow values with raw rgba
- Custom font sizes outside the scale (2.85rem, 0.95rem, 1.55rem, 0.78rem, 0.6875rem)
- `9999px` hardcoded instead of `var(--radius-full)` in 3 places
- The craft is excellent, but it's a separate design language from the rest of the app

---

### 3.8 Account/Settings Page (`/settings`)

**Files:** `AccountPage.tsx`, `AccountPage.module.css`

| # | Question | Score | Notes |
|---|----------|-------|-------|
| 1 | Primary action obvious? | 4 | User info displayed. Management actions clear. |
| 2 | Hierarchy clear? | 4 | Profile → Plan → Management → Notion sections. |
| 3 | System data in user language? | 4 | Plan names, subscription status clear. |
| 4 | Destructive styles reserved? | 5 | Delete account link uses danger styling. |
| 5 | Whitespace generous? | 4 | Good section spacing. |
| 6 | Borders earning their place? | 4 | Section dividers separate logical groups. |
| 7 | Rhythm consistent? | 4 | Consistent section spacing. |
| 8 | Style consistency? | 4 | Clean token usage. Only `50%` avatar radius is off-token. |
| 9 | Detail craft? | 3 | Avatar circle, plan badge. Functional, not considered. |
| 10 | State completeness? | 4 | SkeletonPage loading. Auth check with redirect. |
| 11 | Motion intent? | 2 | No motion. |
| 12 | Considered moment? | 2 | None. Purely functional. |

**Total: 44/60 — Themed pass needed**

**Findings:**
- `.planCard` class name is misleading (flattened in earlier sweep, no longer a card)
- CancellationSurveyModal exists — good state handling for cancellation flow
- No subscription status transition animation
- Avatar is `80px` hardcoded — could be a token

---

### 3.9 Login Page (`/login`)

**Files:** `LoginPage.tsx`, `LoginForm/`, `auth.module.css`

| # | Question | Score | Notes |
|---|----------|-------|-------|
| 1 | Primary action obvious? | 5 | Log in button is primary CTA. |
| 2 | Hierarchy clear? | 5 | Title → Google → divider → email/password → submit → forgot/register links. |
| 3 | System data in user language? | 5 | Voice sweep copy is clean. |
| 4 | Destructive styles reserved? | 5 | N/A. |
| 5 | Whitespace generous? | 5 | `formCard` with 2.5rem/2rem padding. Fields at 1.5rem margin. |
| 6 | Borders earning their place? | 5 | Divider between Google and email login is purposeful. |
| 7 | Rhythm consistent? | 5 | 1.5rem field spacing, 0.75rem divider gaps, all uniform. |
| 8 | Style consistency? | 5 | `auth.module.css` uses tokens perfectly. Cleanest file in the project. |
| 9 | Detail craft? | 4 | Google button with shadow distinction from submit. Good focus states. |
| 10 | State completeness? | 3 | No loading indicator during login submission. Error messages display. |
| 11 | Motion intent? | 2 | Only hover transitions. No submit feedback animation. |
| 12 | Considered moment? | 3 | Clean form card on secondary background. Not a moment, but correct. |

**Total: 52/60 — Minor polish**

**Findings:**
- No loading spinner on form submission — button should show spinner/disabled
  state during API call
- Magic link button and login button are visually differentiated well
- `topBar` for "Don't have an account?" is well placed

---

### 3.10 Register Page (`/register`)

**Files:** `RegisterPage.tsx`, `RegisterForm.tsx`, `auth.module.css`

| # | Question | Score | Notes |
|---|----------|-------|-------|
| 1 | Primary action obvious? | 5 | Create account button. |
| 2 | Hierarchy clear? | 5 | Same pattern as login. |
| 3 | System data in user language? | 5 | Voice sweep copy. |
| 4 | Destructive styles reserved? | 5 | N/A. |
| 5 | Whitespace generous? | 5 | Same auth card. |
| 6 | Borders earning their place? | 5 | Same divider pattern. |
| 7 | Rhythm consistent? | 5 | Same spacing. |
| 8 | Style consistency? | 5 | Same auth.module.css. |
| 9 | Detail craft? | 4 | Password strength indicator is a nice addition. |
| 10 | State completeness? | 3 | No loading on submit. ToS checkbox present. |
| 11 | Motion intent? | 2 | Same as login. |
| 12 | Considered moment? | 3 | Password strength indicator with color feedback. |

**Total: 52/60 — Minor polish**

**Findings:**
- Same loading state gap as login
- Password strength indicator is the closest to a considered moment

---

### 3.11 Forgot Password / Reset Password

**Files:** `ForgotPasswordForm.tsx`, `NewPasswordForm.tsx`, `auth.module.css`

| # | Question | Score | Notes |
|---|----------|-------|-------|
| 1 | Primary action obvious? | 5 | Single action per page. |
| 2 | Hierarchy clear? | 5 | Title → field → button. |
| 3 | System data in user language? | 5 | Voice sweep copy. |
| 4 | Destructive styles reserved? | 5 | N/A. |
| 5 | Whitespace generous? | 5 | Auth card. |
| 6 | Borders earning their place? | 5 | Minimal. |
| 7 | Rhythm consistent? | 5 | Auth pattern. |
| 8 | Style consistency? | 5 | Same tokens. |
| 9 | Detail craft? | 3 | Functional. |
| 10 | State completeness? | 3 | No loading on submit. CheckYourEmail state exists. |
| 11 | Motion intent? | 2 | None. |
| 12 | Considered moment? | 2 | None. |

**Total: 50/60 — Minor polish**

---

### 3.12 About Page (`/about`)

**Files:** `AboutPage.tsx`, `AboutPage.module.css`

| # | Question | Score | Notes |
|---|----------|-------|-------|
| 1 | Primary action obvious? | 4 | CTA to upload page. |
| 2 | Hierarchy clear? | 4 | Hero → How it works → Philosophy. |
| 3 | System data in user language? | 5 | Human copy. |
| 4 | Destructive styles reserved? | 5 | N/A. |
| 5 | Whitespace generous? | 4 | Good spacing. |
| 6 | Borders earning their place? | 4 | Steps card has subtle shadow. |
| 7 | Rhythm consistent? | 4 | 1.5rem gaps in step list. |
| 8 | Style consistency? | 5 | All tokens. Step numbers use primary-light bg. |
| 9 | Detail craft? | 3 | Step numbers in circles are clean. |
| 10 | State completeness? | 5 | Static page — no states needed. |
| 11 | Motion intent? | 1 | None. |
| 12 | Considered moment? | 2 | Numbered steps are functional. No delight. |

**Total: 46/60 — Minor polish**

**Findings:**
- `stepNumber` uses hardcoded `28px` dimensions
- Philosophy section feels tacked on — same font size as everything else
- No illustration or visual interest beyond the numbered steps

---

### 3.13 Contact Page (`/contact`)

**Files:** `ContactPage.tsx`, shared.module.css

| # | Question | Score | Notes |
|---|----------|-------|-------|
| 1 | Primary action obvious? | 4 | Email link is the action. |
| 2 | Hierarchy clear? | 5 | Title → email → what to include. |
| 3 | System data in user language? | 5 | Friendly tone. |
| 4 | Destructive styles reserved? | 5 | N/A. |
| 5 | Whitespace generous? | 4 | Card padding adequate. |
| 6 | Borders earning their place? | 4 | Single card. |
| 7 | Rhythm consistent? | 4 | Standard page layout. |
| 8 | Style consistency? | 5 | Uses shared styles only. |
| 9 | Detail craft? | 2 | Very minimal. Just a card with text. |
| 10 | State completeness? | 5 | Static — no states needed. |
| 11 | Motion intent? | 1 | None. |
| 12 | Considered moment? | 1 | None. The most basic page in the app. |

**Total: 45/60 — Minor polish**

---

### 3.14 Documentation (`/documentation`)

**Files:** `DocsPage.tsx`, `DocsPage.module.css`, `DocsDrawer.tsx`

| # | Question | Score | Notes |
|---|----------|-------|-------|
| 1 | Primary action obvious? | 4 | Content is the focus. Navigation in sidebar. |
| 2 | Hierarchy clear? | 5 | Sidebar → article header → content → pager. |
| 3 | System data in user language? | 5 | Human. |
| 4 | Destructive styles reserved? | 5 | N/A. |
| 5 | Whitespace generous? | 5 | 2.5rem gap, 760px content width. |
| 6 | Borders earning their place? | 5 | H2 border-bottom, article header bottom border, pager borders. |
| 7 | Rhythm consistent? | 5 | Markdown styles have uniform spacing. |
| 8 | Style consistency? | 3 | Code block colors hardcoded (`#0b1020`, `#e5e7eb`). Copy button uses raw rgba. Link underlines use raw rgba(59,130,246,0.35). |
| 9 | Detail craft? | 4 | Callout variants (note/tip/warning), styled step counters, copy button on code blocks, prev/next pager, mobile drawer. |
| 10 | State completeness? | 4 | Home state, article state, WIP banner. Mobile drawer. |
| 11 | Motion intent? | 3 | Drawer slides in with animation. Transitions on hover. |
| 12 | Considered moment? | 4 | Styled step counters with numbered circles matching primary color. Active sidebar with border-left indicator. |

**Total: 52/60 — Minor polish**

**Findings:**
- Code block colors need theme tokens (F7)
- `rgba(59, 130, 246, 0.35)` link underlines repeat in 2 places — should derive from primary
- Drawer has hardcoded `rgba(0,0,0,0.5)` backdrop and `rgba(0,0,0,0.15)` shadow
- Mobile drawer animation `0.18s ease-out` is hardcoded

---

### 3.15 Not Found Page (404)

**Files:** `NotFoundPage.tsx`, shared.module.css

| # | Question | Score | Notes |
|---|----------|-------|-------|
| 1 | Primary action obvious? | 5 | "Go to homepage" button. |
| 2 | Hierarchy clear? | 5 | Title → explanation → CTA. |
| 3 | System data in user language? | 5 | "This page doesn't exist or may have moved." |
| 4 | Destructive styles reserved? | 5 | N/A. |
| 5 | Whitespace generous? | 4 | Centered layout. |
| 6 | Borders earning their place? | 5 | None needed. |
| 7 | Rhythm consistent? | 4 | Good. |
| 8 | Style consistency? | 3 | Inline `style={{ display: 'inline-flex', width: 'auto' }}` on button. |
| 9 | Detail craft? | 2 | No illustration, no 404 number, no personality. |
| 10 | State completeness? | 5 | This IS the error state. |
| 11 | Motion intent? | 1 | None. |
| 12 | Considered moment? | 1 | None. Generic. |

**Total: 45/60 — Minor polish**

**Findings:**
- Inline style should move to a CSS class
- No personality — adding a subtle illustration or the mascot would help
- No search suggestion or recent pages

---

### 3.16 Successful Checkout

**Files:** `SuccessfulCheckout.tsx`, `LoadingState.tsx`, `UserActionCards.tsx`

| # | Question | Score | Notes |
|---|----------|-------|-------|
| 1 | Primary action obvious? | 4 | Action cards guide next steps. |
| 2 | Hierarchy clear? | 4 | Loading → Success with confetti → Action cards. |
| 3 | System data in user language? | 5 | Friendly success copy. |
| 4 | Destructive styles reserved? | 5 | N/A. |
| 5 | Whitespace generous? | 4 | Card layout. |
| 6 | Borders earning their place? | 4 | Action cards with borders. |
| 7 | Rhythm consistent? | 4 | Card grid. |
| 8 | Style consistency? | 4 | Good token usage. |
| 9 | Detail craft? | 3 | Functional cards. |
| 10 | State completeness? | 5 | Loading with confetti, success, timeout warning. |
| 11 | Motion intent? | 4 | Confetti animation on success. |
| 12 | Considered moment? | 5 | Confetti on checkout success. A genuine delight moment. |

**Total: 51/60 — Minor polish**

---

### 3.17 Delete Account (`/delete-account`)

**Files:** `DeleteAccountPage.tsx`, `AccountPage.module.css`

| # | Question | Score | Notes |
|---|----------|-------|-------|
| 1 | Primary action obvious? | 4 | Delete button. Two-step confirmation. |
| 2 | Hierarchy clear? | 4 | Warning → instructions → confirmation button. |
| 3 | System data in user language? | 5 | Clear warning text. |
| 4 | Destructive styles reserved? | 5 | Danger button styling. |
| 5 | Whitespace generous? | 4 | Standard page. |
| 6 | Borders earning their place? | 4 | Card container. |
| 7 | Rhythm consistent? | 4 | Standard. |
| 8 | Style consistency? | 4 | Token usage good. |
| 9 | Detail craft? | 4 | "I am sure!" escalation is good UX. |
| 10 | State completeness? | 4 | In-progress "Deleting..." state. |
| 11 | Motion intent? | 2 | None. |
| 12 | Considered moment? | 3 | Two-step deletion is protective but not delightful (correctly). |

**Total: 47/60 — Minor polish**

---

### 3.18 Ankify Pages (`/ankify`, `/ankify/setup`, `/ankify/history`)

**Files:** `AnkifyPage.tsx`, `AnkifySetupPage.tsx`, `AnkifyHistoryPage.tsx`,
`AnkifyPage.module.css`

| # | Question | Score | Notes |
|---|----------|-------|-------|
| 1 | Primary action obvious? | 4 | Workspace actions visible. |
| 2 | Hierarchy clear? | 4 | Sections with eyebrows and titles. |
| 3 | System data in user language? | 4 | Sync status clear. |
| 4 | Destructive styles reserved? | 4 | Warning styles for conflicts. |
| 5 | Whitespace generous? | 4 | Section spacing. |
| 6 | Borders earning their place? | 4 | Section dividers. |
| 7 | Rhythm consistent? | 3 | Large CSS file (1100+ lines) suggests scope creep. Multiple spacing patterns. |
| 8 | Style consistency? | 2 | Hardcoded shadows (0 8px 24px), rgba backgrounds, `999px` radius. Most token debt after PricingPage. |
| 9 | Detail craft? | 4 | Section icons, eyebrow text, conflict modal. Well-structured UI. |
| 10 | State completeness? | 5 | Skeleton loading, setup wizard, timeout handling, conflict resolution modal, export schedule. |
| 11 | Motion intent? | 3 | Some transitions. Setup step progression. |
| 12 | Considered moment? | 3 | Section icons with primary-light backgrounds. Functional. |

**Total: 44/60 — Themed pass needed**

**Findings:**
- 1100+ line CSS file — largest in the project by far
- Hardcoded shadows and colors
- `999px` border-radius instead of `var(--radius-full)`
- Could benefit from splitting CSS into sub-components

---

### 3.19 Sidebar & AppShell

**Files:** `AppShell.tsx`, `Sidebar.tsx`, `MobileTopBar.tsx`,
`AppShell.module.css`

| # | Question | Score | Notes |
|---|----------|-------|-------|
| 1 | Primary action obvious? | 4 | Navigation is clear. Active route highlighted. |
| 2 | Hierarchy clear? | 5 | Logo → nav → theme switcher → copyright. |
| 3 | System data in user language? | 5 | Nav labels human. |
| 4 | Destructive styles reserved? | 5 | N/A. |
| 5 | Whitespace generous? | 3 | Sidebar rows use 8px/12px padding — slightly cramped. |
| 6 | Borders earning their place? | 4 | Right border separates sidebar from content. |
| 7 | Rhythm consistent? | 3 | Hardcoded px gaps (10px, 20px, 4px) instead of tokens. |
| 8 | Style consistency? | 3 | Hardcoded font-weights (400, 500), `200ms ease` transition, hardcoded px spacing. |
| 9 | Detail craft? | 3 | Active row with primary color bg. Theme-aware logo swap. |
| 10 | State completeness? | 4 | Mobile drawer, theme switcher, conditional plan indicator. |
| 11 | Motion intent? | 3 | Hover transitions. Mobile drawer has animation. |
| 12 | Considered moment? | 4 | Theme switcher with radio buttons in a pill shape. Theme-aware logo swap. |

**Total: 46/60 — Minor polish**

**Findings:**
- All spacing uses hardcoded px instead of `--space-*` tokens (F10)
- Font weights hardcoded instead of `var(--font-normal/medium)`
- `200ms ease` transition instead of `--transition-fast`
- Mobile backdrop color not tokenized (F2)
- Sidebar width `240px` is fine as a structural constant

---

### 3.20 NavigationBar (anonymous users)

**Files:** `NavigationBar.tsx`, `NavigationBar.module.css`

| # | Question | Score | Notes |
|---|----------|-------|-------|
| 1 | Primary action obvious? | 5 | Log in button stands out. |
| 2 | Hierarchy clear? | 5 | Logo → links → login CTA. |
| 3 | System data in user language? | 5 | Simple labels. |
| 4 | Destructive styles reserved? | 5 | N/A. |
| 5 | Whitespace generous? | 4 | Adequate padding. |
| 6 | Borders earning their place? | 5 | Bottom border-light separates from content. |
| 7 | Rhythm consistent? | 4 | Link padding uniform. |
| 8 | Style consistency? | 5 | All tokens used. |
| 9 | Detail craft? | 4 | Login button with shadow, primary background. Burger with minimal styling. |
| 10 | State completeness? | 4 | Active link state. Mobile menu toggle. Theme-aware logo. |
| 11 | Motion intent? | 3 | Color transitions on hover. |
| 12 | Considered moment? | 3 | Clean, but no standout moment. |

**Total: 52/60 — Minor polish**

---

### 3.21 Email Templates (server-generated)

**Files:** `src/services/EmailService/templates/*.html`

| # | Question | Score | Notes |
|---|----------|-------|-------|
| 1 | Primary action obvious? | 3 | Link/button present but minimal styling. |
| 2 | Hierarchy clear? | 3 | Basic HTML structure. |
| 3 | System data in user language? | 4 | Copy is human. |
| 4 | Destructive styles reserved? | 5 | N/A. |
| 5 | Whitespace generous? | 2 | Minimal inline styles. |
| 6 | Borders earning their place? | 2 | No visual structure. |
| 7 | Rhythm consistent? | 2 | Plain HTML without design system. |
| 8 | Style consistency? | 1 | Inline styles, no tokens, no brand colors, no font stack. |
| 9 | Detail craft? | 1 | Raw HTML with minimal formatting. |
| 10 | State completeness? | 3 | Templates exist for each flow. |
| 11 | Motion intent? | 1 | N/A for email. |
| 12 | Considered moment? | 1 | None. These are the weakest surfaces. |

**Total: 28/60 — Rethink before shipping**

**Findings:**
- No brand identity in emails
- No consistent template structure — `reset.html` and `convert.html` load
  Bulma CSS from a CDN, `magic-link.html` uses inline CSS with hardcoded
  `#3273dc` blue, `subscription-cancelled.html` has no CSS at all
- `subscription-cancelled.html` and `subscription-scheduled-cancellation.html`
  use "Hei {{name}}" (Norwegian) instead of English — inconsistent with the
  rest of the product's voice
- Hardcoded Stripe billing portal URL in cancellation emails
- `convert-link.html` has duplicate "Happy learning" sign-offs
- No dark mode support (prefers-color-scheme)
- No mobile-responsive layout
- CTA button in `magic-link.html` is styled; all other templates use plain links
- The most impactful improvement per unit of effort in the entire product

---

### 3.22 Server Download Page (SSR)

**Files:** `src/ui/pages/DownloadPage.tsx`

| # | Question | Score | Notes |
|---|----------|-------|-------|
| 1 | Primary action obvious? | 3 | Download links listed. |
| 2 | Hierarchy clear? | 3 | Title → file list. |
| 3 | System data in user language? | 3 | "No Anki Decks Available" or file list. |
| 4 | Destructive styles reserved? | 5 | N/A. |
| 5 | Whitespace generous? | 2 | Minimal. SSR with basic styling. |
| 6 | Borders earning their place? | 2 | None. |
| 7 | Rhythm consistent? | 2 | Basic list. |
| 8 | Style consistency? | 1 | No tokens. No brand styles. Plain HTML. |
| 9 | Detail craft? | 1 | Unstyled. |
| 10 | State completeness? | 3 | Empty state message exists. |
| 11 | Motion intent? | 1 | None. |
| 12 | Considered moment? | 1 | None. |

**Total: 27/60 — Rethink before shipping**

---

## 4. Considered Moments Inventory

### Existing considered moments

| Surface | Moment | Quality |
|---------|--------|---------|
| Pricing Page | Elevated Pro card with glow shadow, staggered entrance animation | Excellent |
| Pricing Page | Lifetime ∞ badge in circular border | Excellent |
| Pricing Page | Hosted Anki dashed border with animated sync dots | Excellent |
| Pricing Page | CTA arrow slides right on hover | Good |
| Successful Checkout | Confetti animation on payment success | Excellent |
| Search Page | Oversized search input with bottom-border-only | Good |
| Import Page | Pulsing dot on active step indicator | Good |
| Sidebar | Theme switcher pill with radio buttons | Good |
| Sidebar | Theme-aware logo swap (mascot head for dark themes) | Good |
| Docs Page | Numbered step circles matching primary color | Good |
| Docs Page | Active sidebar item with left border indicator | Good |
| Download Button | State transition: primary → success green when ready | Good |

### Missing — recommended additions (max 5)

1. **404 Page** — Add the mascot illustration (already have assets in `/mascot/`).
   The page is seen by lost users; a friendly face makes a difference.

2. **Empty Downloads** — The `EmptyDownloadsSection` has structure but no
   illustration. A simple icon or mascot sketch would add warmth.

3. **Login/Register forms** — Subtle card entrance animation (fade-up, 200ms).
   First impression for new users.

4. **Upload drop zone** — Brief "pulse" effect when file is accepted (before
   navigating to download). Acknowledges the action.

5. **Account Page** — Plan badge could have a subtle shine/gradient for paid
   users. Rewards the subscription.

---

## 5. Implementation Priorities

### Pass 1: Token consistency (cross-cutting)
**Priority: Highest — foundation for everything else**

- Replace all 11 hardcoded `0.15s ease` with `var(--transition-fast)`
- Replace all `200ms ease` / `240ms ease` with `var(--transition-fast)` or add `--transition-normal`
- Replace all `50%` border-radius with `var(--radius-full)`
- Add and use `--color-backdrop` token
- Add and use `--color-code-bg` / `--color-code-text` tokens
- Replace hardcoded `rgba(59,130,246,0.35)` link underlines in DocsPage
- Replace hardcoded focus ring rgba in shared.module.css
- Replace hardcoded font-weights in AppShell with tokens
- Replace hardcoded px spacing in AppShell sidebar with `--space-*` tokens
- Remove inline style on 404 page button

**Files:** UploadForm.module.css, DownloadsPage.module.css, ImportPage.module.css,
PricingPage.module.css (transitions only), StepIndicator.module.css,
AppShell.module.css, DocsPage.module.css, shared.module.css, NotFoundPage.tsx

### Pass 2: Structural deduplication
**Priority: High — reduces maintenance surface**

- Remove duplicated spinner CSS from DownloadsPage (use shared `.spinner`)
- Migrate `ListJobs.css` global classes to CSS modules
- Extract `max-width` constants or compose from shared page classes
- Collapse `convertButton` / `downloadButton` in UploadForm to compose
  from shared button classes

**Files:** DownloadsPage.module.css, ListJobs.css → ListJobs.module.css,
UploadForm.module.css, Skeleton.module.css

### Pass 3: State completeness
**Priority: Medium — user experience during waits and errors**

- Add loading/disabled state to auth form submit buttons (Login, Register,
  ForgotPassword, NewPassword)
- Create shared `EmptyState` component; apply to Preview empty, Favorites
  empty
- Standardize on Skeleton components for all loading states (remove raw
  "Loading..." text)

**Files:** auth forms, new EmptyState component, PreviewPage.tsx

### Pass 4: Email template redesign
**Priority: Medium — highest impact-per-effort for perception of quality**

- Create a shared email base template with brand header, footer, responsive
  table layout
- Apply the Inter font stack
- Add CTA button styling
- Add prefers-color-scheme media query for dark mode
- Apply VOICE.md principles to email copy

**Files:** All 6 templates in `src/services/EmailService/templates/`

### Pass 5: Detail craft
**Priority: Lower — polish after foundation is clean**

- Add subtle card entrance animation to auth form cards
- Add mascot illustration to 404 page
- Add illustration/icon to EmptyDownloadsSection
- Add `tabular-nums` to price columns and any number displays
- Tighten letter-spacing on large headings (`--tracking-tight` on h1/h2)
  consistently

### Pass 6: Considered moments (restrained)
**Priority: Lowest — do after everything else is clean**

- Upload acceptance pulse
- Plan badge shine for paid users on Account page
- Only 2–3 new moments. More than that cheapens the existing ones.

---

## 6. Out of Scope / Flagged for Human Decision

1. **PricingPage token debt vs. craft** — The page has the most hardcoded
   values but also the highest craft level. Tokenizing its custom font sizes
   (2.85rem, 0.95rem, etc.) means either adding non-standard tokens to the
   scale or accepting that this page uses a different type scale. **Decision
   needed:** tokenize the custom sizes, or leave PricingPage as a
   design-exception with a comment?

2. **Server Download Page** — Scored 27/60. This is an SSR page that users
   reach via download links. Redesigning it to match the app's design system
   requires either shipping CSS to the SSR response or redirecting to a
   React route. **Decision needed:** keep as-is, style it, or redirect?

3. **AnkifyPage.module.css at 1100+ lines** — The largest CSS file by far.
   Should it be split into sub-component modules, or is the current monolith
   acceptable given that Ankify is a single-page feature?

4. **ListJobs.css global classes** — The only non-module CSS file for a
   component. Migrating to CSS modules would be correct but touches test
   selectors. **Decision needed:** migrate now or defer?

5. **Email template engine** — Current templates use string replacement
   (`{{link}}`). A proper redesign might warrant a lightweight template
   engine (mjml, react-email). **Decision needed:** stay with string
   replacement or upgrade?
