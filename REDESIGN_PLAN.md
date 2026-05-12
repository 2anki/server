# Redesign plan — 2anki.net frontend

Target aesthetic: Stripe-clean. Generous whitespace, restrained color, type-led hierarchy, shadows over borders, one primary action per screen. Mobile-first at 380px.

---

## 1. Route inventory

### High-traffic public pages

| Route | Component | Quality | Main issues |
|---|---|---|---|
| `/` | HomePage | 3/5 | Redirects logged-in users to `/upload` — anon hero + upload form + "Happy learning!" is underwhelming. No clear single CTA. |
| `/upload` | UploadPage | 3/5 | Copy lists supported files as comma blob. Settings icon only appears after file interaction — unclear affordance. Helper text is dense. |
| `/login` | LoginPage | 3/5 | Standard auth form. Needs visual polish, tighter spacing, card surface treatment. |
| `/register` | RegisterPage | 3/5 | Same auth treatment as login. |
| `/pricing` | PricingPage | 2/5 | Pricing display — needs stop-and-ask review before any copy changes (hard constraint). |
| `/notion-to-anki` | LandingPage (Notion) | 2/5 | SEO landing. Likely boilerplate hero + CTA. |
| `/quizlet-to-anki` | LandingPage (Quizlet) | 2/5 | Same template, different copy. |
| `/markdown-to-anki` | LandingPage (Markdown) | 2/5 | Same. |
| `/pdf-to-anki` | LandingPage (PDF) | 2/5 | Same. |
| `/about` | AboutPage | 3/5 | Static content page. |
| `/contact` | ContactPage | 3/5 | Static content page. |
| `/documentation` | DocsPage | 3/5 | Sidebar + markdown content. Needs responsive nav audit. |

### High-traffic authenticated pages

| Route | Component | Quality | Main issues |
|---|---|---|---|
| `/notion` (search) | SearchPage | 3/5 | **Priority #1 per spec.** Good state handling but copy is wordy. Search bar styling is functional but boxy. Empty/error states need refinement. |
| `/downloads` | DownloadsPage | 3/5 | Job history list. Likely needs card-based layout, better status indicators, clearer empty state. |
| `/preview/:id` | PreviewPage | 3/5 | Card preview — needs generous spacing, clearer card boundaries. |
| `/preview/apkg/:key` | PreviewApkgPage | 3/5 | APKG preview variant. |
| `/rules/:id` | RulesPage | 2/5 | Rule editor — complex form, likely dense. |
| `/settings/card-options` | CardOptionsPage | 3/5 | Form-heavy settings. Needs grouping and breathing room. |
| `/import` | ImportPage | 3/5 | APKG import flow. |
| `/favorites` | FavoritesPage | 3/5 | Saved items list. |

### Ankify pages (feature-gated)

| Route | Component | Quality | Main issues |
|---|---|---|---|
| `/ankify` | AnkifyPage | 3/5 | Main Ankify interface. |
| `/ankify/setup` | AnkifySetupPage | 3/5 | Configuration. |
| `/ankify/history` | AnkifyHistoryPage | 3/5 | Job history. |

### Account & settings

| Route | Component | Quality | Main issues |
|---|---|---|---|
| `/account` (`/settings`) | AccountPage | 3/5 | Account settings, subscription info. |
| `/delete-account` | DeleteAccountPage | 2/5 | Destructive action — needs careful treatment: confirm dialog, not big red button. |
| `/forgot` | ForgotPasswordPage | 3/5 | Standard forgot-password form. |
| `/users/r/:id` | NewPasswordPage | 3/5 | Password reset. |
| `/auth/magic` | MagicLinkPage | 3/5 | Magic link landing. |

### Utility & admin

| Route | Component | Quality | Main issues |
|---|---|---|---|
| `/ops` | OpsLayout | 3/5 | Admin-only (Al). Lower priority for visual polish but still benefits from design system. |
| `/ops/business` | BusinessTab | 3/5 | Admin metrics. |
| `/successful-checkout` | SuccessfulCheckout | 3/5 | Post-payment confirmation. |
| `/debug` | DebugPage | 2/5 | Dev tools. Lowest priority. |
| `/print` | PrintPage | 3/5 | Print layout. |
| `*` | NotFoundPage | 2/5 | 404 — should have helpful empty state with next action. |

### Redirects (no work needed)

- `/uploads` -> `/downloads`
- `/search` -> `/notion`

---

## 2. Redesign order (high-traffic, high-pain first)

### Tier 1 — Core conversion flow (design system + these screens first)
1. **Design system foundations** (tokens, primitives)
2. **SearchPage** (`/notion`) — documented #1 starting point
3. **UploadPage** (`/upload`) — primary conversion entry
4. **DownloadsPage** (`/downloads`) — where users get their decks
5. **PreviewPage** (`/preview/:id`) — card review before download
6. **HomePage** (`/`) — first impression for anonymous visitors

### Tier 2 — Auth & onboarding
7. **LoginPage** (`/login`)
8. **RegisterPage** (`/register`)
9. **ForgotPasswordPage** (`/forgot`)
10. **NewPasswordPage** (`/users/r/:id`)
11. **MagicLinkPage** (`/auth/magic`)
12. **CheckYourEmail** (component, not a route)

### Tier 3 — Settings & management
13. **CardOptionsPage** (`/settings/card-options`)
14. **RulesPage** (`/rules/:id`)
15. **AccountPage** (`/account`)
16. **DeleteAccountPage** (`/delete-account`)
17. **FavoritesPage** (`/favorites`)
18. **ImportPage** (`/import`)

### Tier 4 — Content & marketing
19. **Landing pages** (all 4: Notion, Quizlet, Markdown, PDF)
20. **DocsPage** (`/documentation`)
21. **AboutPage** (`/about`)
22. **ContactPage** (`/contact`)
23. **PricingPage** (`/pricing`) — STOP-AND-ASK before any changes

### Tier 5 — Feature & admin
24. **AnkifyPage** (`/ankify`)
25. **AnkifySetupPage** (`/ankify/setup`)
26. **AnkifyHistoryPage** (`/ankify/history`)
27. **PreviewApkgPage** (`/preview/apkg/:key`)
28. **SuccessfulCheckout** — STOP-AND-ASK (billing-adjacent)
29. **OpsPage** (`/ops`) — admin only
30. **NotFoundPage** (`*`)
31. **DebugPage** (`/debug`)
32. **PrintPage** (`/print`)

---

## 3. Shared primitives inventory

### Current state

The design system already has a solid token foundation in `base.css` (70+ CSS variables) and a shared class library in `shared.module.css` (50+ classes). CSS Modules scoping. Inter font. No Storybook.

### Primitives to redesign (Phase 2)

| Primitive | Current location | Notes |
|---|---|---|
| **Tokens** | `web/src/styles/base.css` | Refine: tighten shadow scale, add elevation levels, review color contrast ratios, ensure 4/8px spacing discipline. |
| **Page containers** | `.page`, `.pageNarrow`, `.pageWide` in shared.module.css | Good. Review mobile padding at 380px. |
| **Buttons** | `.btnPrimary`, `.btnSecondary`, `.btnOutline`, `.btnDanger`, `.btnIcon`, `.btnGhost`, `.btnSmall`, `.btnSmallPill` in shared.module.css | Solid variety. Audit: ensure action hierarchy is clear (primary/secondary/tertiary/destructive). Stripe-ify: slightly taller touch targets on mobile. |
| **Cards/surfaces** | `.card`, `.sectionCard`, `.surface`, `.surfaceWarning` in shared.module.css | Move from borders to subtle shadows per Stripe aesthetic. |
| **Alerts/notifications** | `.alertDanger/Success/Warning/Info`, `.notification*` in shared.module.css | Good semantic coverage. Some hardcoded hex colors — move to tokens. |
| **Badges** | `.badge`, `.badgePrimary/Danger/Success/Warning` in shared.module.css | Fine. |
| **Modals** | `.modal*` classes in shared.module.css | Review overlay opacity, card radius, header/footer treatment. |
| **Search bar** | `.searchBarWrapper`, `.searchBarGroup`, `.searchButton` in shared.module.css | Needs Stripe-style treatment: subtle shadow, rounder, tighter. |
| **Skeleton/Loading** | `Skeleton.tsx` component | Review shimmer animation timing. |
| **ErrorPresenter** | `ErrorPresenter.tsx` component | Review copy and visual treatment. |
| **StepIndicator** | `StepIndicator.tsx` component | Review visual treatment. |
| **Sidebar/AppShell** | `AppShell.tsx`, `Sidebar.tsx`, `MobileTopBar.tsx` | Review mobile breakpoint (currently 1024px). Stripe sidebar style: minimal, clean nav items. |
| **NavigationBar** | `NavigationBar.tsx` | Public-facing top nav. Review burger menu, brand placement. |
| **Footer** | `Footer.tsx` | Minimal footer treatment. |
| **Empty states** | `.emptyState` in shared.module.css | Needs illustration or icon + helpful copy pattern. |
| **Form fields** | Global input styles in base.css + `.field`, `.checkbox`, `.select` in shared.module.css | Review focus ring, label treatment, error state integration. |
| **Chips** | `.chip`, `.chipActive` in shared.module.css | Good. |

### Layout components
| Component | File | Notes |
|---|---|---|
| `AppShell` | `web/src/components/AppShell/AppShell.tsx` | Switches sidebar/topbar based on auth state |
| `SidebarLayout` | `web/src/components/AppShell/SidebarLayout.tsx` | Sidebar + content area |
| `PageLayout` | `web/src/components/Layout/PageLayout.tsx` | NavBar + Footer + ErrorPresenter |

### Icons
26 Heroicon components in `web/src/components/icons/`. All accept `width`/`height` props, use `fill="currentColor"`. No changes needed — just ensure consistent sizing.

---

## 4. Hardcoded hex audit

Several hardcoded hex values in `shared.module.css` should become tokens in Phase 2:
- `#fde68a` (warning notification border)
- `#92400e` (warning notification text)
- `#a7f3d0` (success notification/alert border)
- `#065f46` (success notification/alert text)
- `#fbbf24` (warning alert border)
- `#bfdbfe` (info notification/alert border)
- `#1e40af` (info notification/alert/tag text)
- `#991b1b` (danger alert text)
- `#3b82f6` (dot-info bg — already `--color-primary`)
- `#ef4444` (dot-danger bg)
- `#f59e0b` (dot-warning bg)

---

## 5. Stop-and-ask items (flagged upfront)

- **PricingPage**: Any copy or visual change needs review (hard constraint: 100-card limit, tier structure).
- **SuccessfulCheckout**: Billing-adjacent — flag before changes.
- **Auth flow UI**: Visual polish only — no flow changes. Will proceed but flag if any behavioral ambiguity.
- **DeleteAccountPage**: Destructive action styling. Will apply framework (neutral style, confirm dialog) but flag if current flow is unclear.

---

## 6. Technical approach

- **No new dependencies.** CSS Modules + CSS Variables is the right stack for this codebase.
- **No Storybook** — the codebase doesn't have it and adding it is a dep + config overhead. Will visually verify via dev server.
- **Mobile-first**: Start CSS at 380px, add `min-width` media queries to scale up.
- **Shadows over borders**: Replace `border: 1px solid var(--color-border)` with `box-shadow: var(--shadow-*)` on surfaces where appropriate.
- **One primary action per screen**: Audit each page for competing CTAs.
- **Copy rewrites**: Sentence case, verb-first buttons, plain-language errors, constructive empty states.
