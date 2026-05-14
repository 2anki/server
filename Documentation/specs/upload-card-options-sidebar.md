## Spec: Card options as a sidebar destination

### Trio synthesis
- **PM**: Remove `CardOptionsRow` from the upload page; add a persistent "Card options" sidebar item exposing global defaults and per-Notion-page overrides. Biggest open question: is there a list endpoint for all saved per-page settings?
- **Designer**: Remove `CardOptionsRow` entirely (no reduced version). Sidebar item in the "your stuff" group using `SettingsIcon`. Extend `CardOptionsPage` with a per-page list + empty/error states. Cut "named profiles" concept entirely.
- **Engineer**: Web-only change, S–M effort. Biggest risk: "individual ones you have created" may mean named global presets (which don't exist) vs. per-page overrides (which do exist, scoped by pageId). Recommends shipping just the nav link first.
- **Agreement**: Remove `CardOptionsRow`, add a `Card options` sidebar nav item pointing to `/card-options`, no backend changes in Phase 1.
- **Conflict**: PM and Designer included the full per-page list in v1; Engineer flagged no confirmed list API and recommended two phases.
- **Resulting plan**: Phase 1 (this spec) — sidebar link + `CardOptionsRow` removal. Phase 2 — per-page saved options list, blocked on confirming or adding the list endpoint.

---

**Outcome**: Reduce friction in finding card options by making them a persistent nav destination rather than a transient bar above the dropzone. Target: lift in the % of logged-in users who open card options at least once per month (discoverability proof). Secondary: successful first-card-review rate +2pp within 30 days.

**Goal alignment**: Cleaner upload flow → fewer abandoned conversions → more users who get value in session → path to 300K users.

**Problem**: `CardOptionsRow` sits as a one-line bar between the page header and the dropzone on `/upload`. For 99% of users it reads "Using defaults · Change" — pure noise on the primary conversion path. For the rare user who wants to tweak options, it opens a modal that closes when they click elsewhere, with no way to find previously-saved per-page options again. Alexander's own read: *"The card options placement feels weird. Consider if it should be a sidebar item where you pick the default one and can see the individual ones you have created."*

**Riskiest assumption**: That users want to manage card options as a persistent, findable destination rather than an inline tweak at upload time. If most uploaders never touch defaults, adding a sidebar slot adds nav weight for nothing.

**Smallest test**: Instrument clicks on `CardOptionsRow` and `SettingsModal` saves (where `pageId != null`) for one week before shipping. If fewer than ~5% of uploaders open options, confirm the sidebar slot is still worth it as a discoverability improvement; if fewer than ~1% save a per-page variant, deprioritize the Phase 2 list entirely.

---

**Scope — Phase 1 (this spec)**

In:
- Add a `Card options` row to `Sidebar.tsx`, in the "your stuff" group (with "My decks"), using the existing `SettingsIcon`. Navigates to `/card-options`. Active state highlights when on `/card-options`.
- Remove `<CardOptionsRow>` from `UploadPage.tsx` entirely. Remove the `showCardOptionsModal` state and `<SettingsModal>` open-by-query-param logic that only existed to support it. Replace the `?view=template|deck-options|card-options` handling with a redirect to `/card-options` so bookmarks and docs links still work.
- Delete `web/src/pages/UploadPage/components/CardOptionsRow/` (component, CSS module, test).

Out (Phase 1):
- Per-page saved options list. Deferred to Phase 2 — needs a confirmed `GET /settings?all=true` (or equivalent) endpoint before building.
- Named/renameable global presets. No data model exists; don't invent one.
- Delete/undo on per-page overrides. Deferred to Phase 2.
- Any changes to `CardOptionsForm` itself.
- Backend/server changes. Web-only.

---

**User story**: As a returning uploader who wants to adjust card options before converting, I want a consistent, findable entry point in the sidebar so I don't have to hunt for a settings bar that may or may not appear on the current page.

**Acceptance criteria — Phase 1**
- [ ] `Card options` appears in `Sidebar.tsx` for logged-in users; highlights as active when the route is `/card-options`.
- [ ] `<CardOptionsRow>` is deleted; `UploadPage.tsx` no longer renders it or manages modal state for it.
- [ ] `?view=template`, `?view=deck-options`, `?view=card-options` on `/upload` redirect to `/card-options`.
- [ ] `CardOptionsPage` continues to work for both the default view (`pageId == null`) and per-page view (`pageId != null`).
- [ ] No new data dependency added to `Sidebar.tsx` (link only; no active template name display in Phase 1).
- [ ] `CardOptionsRow` tests deleted; `Sidebar.test.tsx` updated to cover the new "Card options" row.
- [ ] All existing `CardOptionsPage` behavior (save, reset, per-page deep-link) unchanged.

---

**Leading indicator moved**: % of logged-in users who open card options ≥1×/month. Secondary: successful first-card-review rate. Target: +2pp within 30 days.

**Open questions for engineer**
1. Does a `GET /settings?all=true` (or similar) endpoint exist to return all saved per-page option entries for the current user? This determines whether Phase 2 is a backend addition or a pure frontend list from existing data.
2. Where is the page title cached for past saved options? (Only `pageId` is stored today — the list in Phase 2 will need the title or will show bare IDs.)
3. Does adding `<Link>` to `Sidebar.tsx` for this entry require any auth guard, or is the sidebar already gated to logged-in users only?

**Out of scope (Phase 2)**
- Per-page saved options list with edit/remove actions
- Human-readable preset names ("Med-school cloze", "Code snippets")
- Applying a saved per-page preset to a one-shot upload
- Duplicating a preset as the new default

---

## Design notes

**Sidebar placement**: Second group (with "My decks"), label `Card options`, icon `SettingsIcon` (existing — don't add a new icon). Route: `/card-options`.

```
Upload
Notion to Anki
Anki to Notion
Image Occlusion
———
My decks
Card options        ← new
———
Documentation
Pricing
```

**Upload page**: `CardOptionsRow` bar removed entirely. No inline replacement. The upload page should be focused on the file/Notion URL — settings are a sidebar concern, not a step.

**Query-param redirect copy**: No user-visible copy needed for the redirect. The destination is `Card options` — same label the user saw before.

**`CardOptionsPage` copy updates** (minor, Phase 1):
- Primary save button: `Save defaults` (was `Save card options`)
- Secondary reset button: `Reset to 2anki defaults` (was `Reset to defaults`)

**Mobile**: Sidebar drawer already handles 375px. `CardOptionsForm layout="grid"` already stacks on small screens — no new layout work needed. Verify visually on 375px before shipping.

**Tradeoff**: First-time users no longer see "Card options" on the upload page. The discoverability cost is small — the sidebar label is always visible — and the focus payoff on the conversion path is the right trade.

---

## Technical pre-flight

**Layers touched**: `web` only. No server, no Python bridge.

**Files in play:**

Modified:
- `web/src/components/AppShell/Sidebar.tsx` — add `Card options` `SidebarRow`
- `web/src/components/AppShell/Sidebar.test.tsx` — cover new row
- `web/src/pages/UploadPage/UploadPage.tsx` — remove `<CardOptionsRow>`, remove `showCardOptionsModal` state and `<SettingsModal>` modal logic, add redirect for `?view=…` params
- `web/src/pages/CardOptionsPage/CardOptionsPage.tsx` — minor copy updates to button labels

Deleted:
- `web/src/pages/UploadPage/components/CardOptionsRow/CardOptionsRow.tsx`
- `web/src/pages/UploadPage/components/CardOptionsRow/CardOptionsRow.test.tsx`
- `web/src/pages/UploadPage/components/CardOptionsRow/CardOptionsRow.module.css`

Potentially modified:
- `web/src/components/AppShell/AppShell.module.css` — if sidebar group spacing needs a token

**Cross-language coordination**: None. `create_deck.py` reads `deck_info.json` upstream; this UI change doesn't touch that path.

**Effort**: S (half a day). `CardOptionsPage` exists, `SidebarRow` is a one-liner, deletion is mechanical. Grows to M if active template name is added to the sidebar in Phase 1 (not recommended — adds a data dependency to `Sidebar.tsx`; defer to Phase 2).

**Key concern**: `Sidebar.tsx` currently has zero data dependencies. Keep it that way in Phase 1 — link only, no template name fetch. If `useSettingsCardsOptions` is ever called from `Sidebar`, it fires on every logged-in page load; use the `staleTime: FIFTEEN_MINUTES` cache and profile before committing.

**SettingsModal cleanup**: Once `CardOptionsRow` is deleted, check whether `SettingsModal` has any remaining callers in `UploadPage.tsx`. If not, remove it from the file. If other pages still import it, leave it but remove the upload-page import.
