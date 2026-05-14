# Reset persisted card options

### Trio synthesis
- **PM:** Add `DELETE /api/user-preferences/card-options` scoped to the `cardOptions` field only; reset button in the existing card-options screen; defer per-object list UI until usage proves demand.
- **Designer:** Ship a Settings page with two sections (Defaults + Saved per page), optimistic UI with a 5-second undo toast, no confirm dialog. Adds a bulk-delete endpoint so "Reset all saved pages" is one request.
- **Engineer:** New `DELETE /api/user-preferences` route → controller → use case → repository. No migration. Effort S, ~120 lines across six files. Ownership check at the use-case boundary.
- **Agreement:** New DELETE endpoint at the user-preferences layer. Reuse existing `clearStoredCardOptions` for localStorage. No dependency on PR #2211. Outside-in tests at the route boundary.
- **Conflict:** Designer scoped a whole Settings page + bulk endpoint; PM scoped tight to user defaults; engineer assumed PM scope. **Resolved** by splitting into two phases — this spec is **Phase 1** (user-level reset only). Phase 2 (full Settings page + bulk-delete) gets its own spec once Phase 1 ships and the leading indicator confirms demand. Second conflict: confirm dialog vs. undo toast — **resolved in favor of undo toast** per VOICE.md ("Done." not "Are you sure?").
- **Resulting plan:** Ship `DELETE /api/user-preferences/card-options` and a "Reset to defaults" affordance inside the existing card-options form, with optimistic UI and a 5s undo toast.

---

## Outcome

A user who has drifted away from defaults can return to them in one click without overwriting each field by hand. Moves the **simpler** lever: a tool people trust enough to experiment with returns more often.

## Goal alignment

Path to 300K depends on returning users. Users who feel locked into stale settings either re-import elsewhere or stop using the tool. A visible reset lowers the cost of experimentation — directly raises retention.

## Problem

A returning user opens 2anki six months after their last project. The deck they tuned then (image occlusion off, custom template, custom default deck name) silently shapes their new conversion now. They overwrite fields one by one, guessing what they changed. The only "undo" today is manual — and there's no `DELETE` endpoint on `user_preferences`.

## Riskiest assumption + smallest test

**Assumption:** users want a single "reset to defaults" action, not per-field overrides.
**Test:** ship the reset and log usage for 30 days. If under 50 calls/week, the per-field UI (Phase 2 Settings page) becomes the right next bet. If higher, build the per-page list next.

## Scope

**In:**
- `DELETE /api/user-preferences/card-options` — clears only the `cardOptions` field on `user_preferences` for the authenticated user. Other fields (theme, AnkiWeb acknowledgment) untouched.
- "Reset to defaults" button inside the existing card-options form.
- Optimistic UI: row snaps to defaults, toast bottom-right with **Undo** for 5 seconds.
- `clearStoredCardOptions` fires alongside the API call so localStorage doesn't reanimate stale values.

**Out:**
- New Settings page with per-page list (Phase 2 — separate spec).
- Bulk "Reset all saved pages" endpoint (Phase 2).
- Reset of `theme` or `ankiWebAcknowledgedAt` (not the user pain).
- Per-field reset granularity (smaller than "all card options").

## User story + acceptance criteria

As a returning user, I want to reset my saved card options to defaults so a stale config from an old project doesn't silently shape my new deck.

- [ ] `DELETE /api/user-preferences/card-options` returns 204 when the row exists and `cardOptions` is now null; returns 204 if `cardOptions` was already null (idempotent).
- [ ] `RequireAuthentication` middleware mounted on the route. `getOwner(res)` called in the use case before any SQL — verified by a test that returns 401 for unauth and a test that confirms a forged owner can't affect another row.
- [ ] Card-options form has a "Reset to defaults" button. Clicking it optimistically updates the form and shows a toast: title `Card options reset to defaults.`, action `Undo`. Toast auto-dismisses after 5s.
- [ ] If undo is pressed within 5s, the prior payload is replayed via the existing `POST /api/settings/create/:id` or equivalent patch path; on success, toast shows `Restored.`.
- [ ] After the 5s window expires with no undo, the server-side delete is final.
- [ ] On failure, the toast becomes an inline error per VOICE.md: `Couldn't reset card options. Try again.` — no stack traces to client.
- [ ] Jest test on `DeleteUserPreferencesUseCase` asserts only `cardOptions` is unset and other fields preserved. Vitest covers the button-to-toast flow.

## Leading indicator + delta

Weekly count of `DELETE /api/user-preferences/card-options` calls. No baseline (endpoint doesn't exist). Target: **50+ calls/week within 30 days of ship**. Above target unblocks scoping the Phase 2 Settings page; below target means per-page pruning is the wrong next bet.

## Open questions

1. Does "reset" mean *null out* the column, or *write the canonical defaults blob*? Recommend null/delete so defaults live in one place (frontend) — verify no downstream reader expects the field to be present.
2. Are any users on legacy `cardOptions` shapes? Resetting may actually be the safest migration path for them — worth a one-line note in the PR body if so.

---

## Design notes

**User moment.** A user opens the card-options form for a new deck and sees values they don't recognise from a project months ago. They want one click to return to "fresh", without losing the value of having an account.

**Affordance.** A single **Reset to defaults** button placed at the bottom of the card-options form, secondary style (`btnSecondary`, neutral — not red). Reset is reversible during the 5-second undo window and trivially re-creatable after; red would overstate the consequence.

**Interaction.**
1. Click **Reset to defaults** → form fields optimistically snap to default values → bottom-right toast appears.
2. Toast displays for 5 seconds with an **Undo** action.
3. Undo restores the previous payload via the existing save endpoint; success toast reads `Restored.`.
4. After 5s with no undo, server-side delete is final.
5. On request failure, the toast turns into an inline error.

**No confirm dialog.** Undo is the safety net. "Are you sure?" is friction that VOICE.md explicitly bans for routine actions.

**Copy strings (VOICE.md-compliant).**

| String | Use |
|---|---|
| `Reset to defaults` | Button label |
| `Card options reset to defaults.` | Success toast title |
| `Undo` | Toast action |
| `Restored.` | Post-undo toast |
| `Couldn't reset card options. Try again.` | Inline error |
| `Couldn't reach the server. Check your connection and try again.` | Generic network error |

**Disabled state.** When `cardOptions` is null/already-defaults, render the button disabled with `title="Already at defaults."`.

**Empty/loading state.** None — the form is the host; if the form loads, the button loads with it.

**Out of scope here (deferred to Phase 2 spec):** the full Settings page with per-page row list and bulk reset action.

---

## Technical pre-flight

**Layers touched:** `routes`, `controllers`, `usecases`, `data_layer`, `web`. `services/` already covers per-object settings — not needed here.

**Files in play:**

| File | Status |
|---|---|
| `src/usecases/UserPreferences/DeleteUserPreferencesUseCase.ts` | NEW |
| `src/controllers/UserPreferencesController.ts` | EDIT — add `deleteCardOptions` method |
| `src/routes/UserPreferencesRouter.ts` | EDIT — add route, confirm `RequireAuthentication` is mounted |
| `src/data_layer/UserPreferencesRepository.ts` | EDIT — add `clearCardOptions(owner)` method |
| `src/data_layer/public/UserPreferences.ts` | DO NOT EDIT — kanel-generated |
| `web/src/lib/backend/Backend.ts` | EDIT — add `resetCardOptions()` |
| `web/src/components/CardOptionsForm/CardOptionsForm.tsx` | EDIT — wire reset button, optimistic UI, undo toast |
| `web/src/lib/data_layer/clearStoredCardOptions.ts` | READ — call alongside API |

**API shape:** `DELETE /api/user-preferences/card-options` (no `:id`, one row per user, idempotent — second call returns 204). The legacy `POST /api/settings/delete/:id` pattern is not perpetuated for new endpoints.

**Migrations:** none. `UPDATE user_preferences SET card_options = NULL WHERE owner = $1`.

**Tests (outside-in, route boundary):**
- `DeleteUserPreferencesUseCase.test.ts` — happy path (cardOptions null, other fields preserved); ownership rejection (different-owner row untouched).
- `UserPreferencesRouter.test.ts` — 401 unauth; 204 auth; row preserved with cardOptions null after call.

**Security + abuse:**
- `getOwner(res)` called in the use case before any SQL.
- Parameterized query `UPDATE user_preferences SET card_options = NULL WHERE owner = $1` — cross-user mutation impossible even if owner check were absent, but check still happens explicitly.
- No rate-limit concern at current scale — user-initiated low-frequency action.

**Effort:** S — ~120 lines across six files. No migration, no LLM, no new table. All patterns already exist.

**Risk:** if `cardOptions` is referenced elsewhere as non-nullable, nulling it will throw at the read site. Spot-check `UserPreferencesRepository.get()` consumers before merge.
