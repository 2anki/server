# Restore hover affordance on /notion search results

### Trio synthesis
- **PM:** Hover on `/notion` row items is invisible — `.entry:hover` background equals the page background. Ship a CSS-only fix; metric-free polish, just looks broken.
- **Designer:** Swap hover background to `--color-bg-tertiary`, drop the no-op `box-shadow`, add a 2px inset left-border accent in `--color-primary`, mirror the same state for `:focus-visible`. No copy changes.
- **Engineer:** Web-only, XS effort, one CSS property change in `SearchObjectEntry.module.css`. Note: this component renders on both `/notion` and `/favorites` — fix applies to both, which is correct (same bug, both surfaces).
- **Agreement:** Pure CSS fix in the scoped module. No JS, no token-value changes, no Playwright visual test. Manual verification across light and dark themes is sufficient.
- **Conflict:** None. PM scoped to `/notion` framing only — engineer flagged the shared component cascades to `/favorites`, designer agreed it's the same bug. **Resolved** by updating the AC to cover both surfaces.
- **Resulting plan:** Edit `.entry:hover` and add `.entry:focus-visible` in `SearchObjectEntry.module.css`; verify on `/notion` and `/favorites` in light + dark themes.

---

## Outcome

A user pointing at a row on `/notion` (or `/favorites`) sees a clear visual response — the row they're about to click looks different from the rest of the list. Moves the **most-beautiful** lever; the product feels responsive instead of static.

## Goal alignment

No direct 300K-path tie. This is polish that defends perceived quality. A productivity tool that doesn't react to the cursor reads as half-broken — and broken-feeling products lose retention quietly.

## Problem

A user lands on `/notion` after connecting, sees a list of their workspace pages, and sweeps the cursor down looking for a specific deck source ("Pharmacology Ch. 4"). Rows don't react. They lose their place, slow down, sometimes click the wrong row and kick off an unwanted conversion. The `.entry:hover` rule still exists; it just sets `background: var(--color-bg-primary)`, which now equals the surrounding card surface — the change is mathematically zero.

## Riskiest assumption + smallest test

**Assumption:** hover background is the missing signal, not row spacing or click-target ambiguity.
**Test:** screenshot `/notion` with 5+ results before touching CSS. If rows are visually separated at rest, the hover-only fix is correct. If rows feel cramped or run together, spacing + dividers should ship first.

## Scope

**In:**
- Hover background change in `.entry:hover` (CSS module).
- 2px inset left-border accent in `--color-primary` via `box-shadow: inset 2px 0 0`.
- Drop the existing `box-shadow: var(--shadow-xs)` — it was compensating for an invisible background.
- `cursor: pointer` on `.entry`.
- `:focus-visible` mirrors hover (same background, same accent) plus a 2px outline with offset.

**Out:**
- Icon or action-button styling changes inside the row (separate pass).
- Row spacing or divider changes (only if the assumption test forces it).
- Mobile/touch — no hover on touch devices.
- A global token-value change in `base.css` (don't touch shared tokens for a scoped problem).
- Playwright visual regression baseline (cost > value for a single rule).

## User story + acceptance criteria

As a user scanning my Notion pages on `/notion`, I want each row to react when I hover it so I can confirm what I'm about to click.

- [ ] Hovering a search-result row produces a visible background shift — contrast ratio ≥ 3:1 between resting and hover fills (WCAG AA non-text UI). `--color-bg-tertiary` against `--color-bg-primary` meets this in all themes (light, dark, warm, purple).
- [ ] Transition is ≤ 150ms — no flash, no scale, no layout shift.
- [ ] A 2px inset left-border in `--color-primary` appears on hover and persists on `:focus-visible`.
- [ ] The same row state applies on `/favorites` (shared component) — verified manually.
- [ ] Verified in both light and dark themes.

## Leading indicator + delta

No clean metric. Don't fabricate one. Ship it; this is "looks broken, fix it" territory.

## Open questions

1. Confirm the resting `.entry` background — is it transparent (inheriting page bg) or set explicitly? Dictates whether the hover token swap alone is enough.
2. Should hover styles also bump trailing action buttons from quieter to full opacity? Designer's call when implementing; harmless either way.

---

## Design notes

**User moment.** The user just connected Notion, opened `/notion`, and is scanning a long workspace list. Their cursor sweeps rows. Today every row looks identical to its neighbours — the hover background collapses into the card surface and `--shadow-xs` is too quiet to register.

**Recommendation.**
- **Background:** swap to `--color-bg-tertiary` (one step deeper than the surrounding `--color-bg-primary`). 6–8% luminance delta against the card; clears 3:1 for non-text UI per WCAG AA.
- **Shadow:** drop `box-shadow: var(--shadow-xs)` — it was compensating for an invisible background. The background shift alone is the signal.
- **Left accent:** add `box-shadow: inset 2px 0 0 var(--color-primary)`. Cheap, no layout shift, directional "you're on this row" cue that survives at low contrast.
- **Cursor:** `cursor: pointer` on `.entry`.
- **Inside the row:** leave title and icon as-is. If trailing action buttons are visually quieter at rest, lift to full opacity on hover.
- **Focus-visible:** mirror hover exactly, plus `outline: 2px solid var(--color-primary)` with `outline-offset: 2px`. Keyboard and mouse users see the same state.

**No copy changes.**

---

## Technical pre-flight

**Layers touched:** `web` only. No server work, no migrations, no cross-language coordination.

**Files in play:**

| File | Status |
|---|---|
| `web/src/pages/SearchPage/components/SearchObjectEntry/SearchObjectEntry.module.css` | EDIT — the only file changed |
| `web/src/styles/base.css` | READ — confirm token values; do not edit |

**The change:** in `.entry:hover`, replace `background: var(--color-bg-primary)` with `background: var(--color-bg-tertiary)`, remove the `box-shadow: var(--shadow-xs)`, add the inset left-border via `box-shadow: inset 2px 0 0 var(--color-primary)`, add `cursor: pointer` on `.entry`. Add a sibling `.entry:focus-visible` rule.

**Effort:** XS. One property swap, one shadow change, one new rule. No component logic, no new tokens, no migrations.

**Tests:** none automated. Manual visual check on `/notion` and `/favorites` in light + dark themes per web CLAUDE.md. Adding a Playwright visual-regression baseline costs more setup than the fix.

**Risk:** `SearchObjectEntry` is rendered by `ListSearchResults`, used on both `/notion` (via `SearchPresenter`) and `/favorites` (via `Favorites`). The hover change applies to both — correct behavior; same invisible-hover bug exists on `/favorites` for the same reason.

**Do not:**
- Change the `--color-bg-tertiary` token value in `base.css` — it's used by `.rulesButton:hover` and `.convertingBadge` and throughout the app.
- Introduce a JS `onMouseEnter`/`onMouseLeave` handler — pure CSS is correct.
- Replace the CSS module with Tailwind or inline styles.
- Add `!important` — specificity is not the problem.
