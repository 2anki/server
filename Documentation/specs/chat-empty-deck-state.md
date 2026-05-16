# Spec: Inline chat on the empty-deck state (Chat as a first-class citizen, slice 2)

**Outcome**: The user whose upload produced 0 cards can ask Claude what to do without leaving `/upload`. Target leading indicator: empty-deck → successful conversion within 30 min recovers from baseline (slice 1 deep-link engagement, TBD) by at least 5 percentage points once analytics lands.

**Goal alignment**: Empty-deck is a soft dead-end today; recovering those sessions to a successful conversion is the cheapest unit of new "users who got value" on the road to 300K.

**Problem**: When a Notion `.zip` produces no toggles, the user sees hardcoded format guidance ("add toggles, re-export") and a "Try a different file" button. Slice 1 added a tertiary deep-link to `/chat`, which works but loses the file context: the user is now on a blank chat with a generic pre-filled prompt and no path back. We see this every week — pdf and Notion exports dominate. The guidance text is correct; the recovery path is the gap.

**Riskiest assumption**: That users who hit the empty-deck state will engage with an inline chat at all. If slice 1's deep-link engagement (when analytics ships) is under 10%, an inline panel won't move the needle either — pull this spec before implementing.

**Smallest test**: Slice 1's deep-link metric, once analytics is live (see PR #2320). The gate for `/implement` on this spec is ≥10% click-through on slice 1's "Ask Claude about this file" link.

**Decision**: Option A — extract `ChatPanel` from `ChatPage` and embed it inline on the empty-deck state. This is the third use site for chat (template editor, upload-error deep-link, empty-deck), so the extraction earns its keep per the "wait for the third" rule. Option B (smarter deep-link with format pre-fill) ships faster but still costs the user a context switch; the empty-deck panel is where we either close the loop or admit chat isn't the right surface here.

**Scope**:
- In: `ChatPanel` extraction; collapsed-by-default panel on `renderEmptyDeckState`; format-specific pre-fill prompt; reuse of existing consent modal, quota UX, and `/api/chat/*` endpoints.
- Out: any new server endpoints; quota changes; inline chat in `renderErrorState`; floating button; anonymous chat; Notion connection-error chat (slice 3); Ankify chat (slice 4).

**ChatPanel extraction plan**:
- New: `web/src/components/ChatPanel/ChatPanel.tsx`, `web/src/components/ChatPanel/ChatPanel.test.tsx`.
- Props: `initialPrompt?: string`, `cameFromUpload?: boolean`, `onCardsGenerated?: (cards) => void`.
- Refactor: `web/src/pages/Chat/ChatPage.tsx` renders `ChatPanel` with conversation sidebar; `UploadForm.tsx` renders `ChatPanel` standalone.
- Consent modal, quota line, attachment chips, SSE streaming all live in `ChatPanel`.

**Embedded behavior**: Inside `renderEmptyDeckState`, the panel is collapsed behind a "Ask Claude about this file" toggle (sentence case, no trailing period — matches the existing "Try a different file" link). On expand, pre-fills the textarea; user can edit before sending. No auto-expand — empty-deck is already busy. Conversation is ephemeral (resets on `Try a different file` or page nav); persist nothing extra to the conversations sidebar from this surface.

**Per-format pre-fill prompts** (derived from the uploaded filename extension or Drive mime type):
- `pdf`: `My PDF converted but produced 0 cards. The PDF has [describe layout — bulleted, prose, tables]. What should I change?`
- `notion-export` (`.zip`): `My Notion export converted but produced 0 cards. There were no toggles in the page. What's the fastest way to turn my notes into toggle blocks?`
- `html`: `My HTML file converted but produced 0 cards. It came from [Notion / browser / other]. What structure does 2anki look for?`
- `md`: `My markdown file converted but produced 0 cards. The file is a flat outline — should I use a specific heading or list pattern?`
- Fallback (`docx`, `csv`, `apkg`, `other`): `My {ext} converted but produced 0 cards. Why might that be?`

**Free vs paid**: Identical to slice 1 — 20 messages/month free, unlimited for `users.patreon = true`. No new quota, no new gate.

**Acceptance criteria**:
- [ ] `ChatPanel` exists at `web/src/components/ChatPanel/` with a colocated Vitest test covering: renders with `initialPrompt`, calls `/api/chat/message`, handles `consent_required`, handles `rate_limit`.
- [ ] `ChatPage.tsx` renders `ChatPanel` and the conversations sidebar; behavior unchanged from slice 1.
- [ ] `renderEmptyDeckState` shows a collapsed `Ask Claude about this file` toggle below the existing actions; expand reveals `ChatPanel` with the format-specific pre-fill.
- [ ] Pre-fill is derived from `driveMimeType` first, then the local filename extension, then the fallback string.
- [ ] When cards are generated inline, the existing `CardPreview` "Save as deck" button works — no duplicate handler.
- [ ] Slice 1's `/chat?from=upload&reason=empty` deep-link is removed from the empty-deck state (replaced by the inline panel). The error-state deep-link stays.
- [ ] One changelog entry in `web/src/pages/WhatsNewPage/changelog.ts`: `Empty deck — ask Claude what to fix without leaving the upload page`.
- [ ] `pnpm --filter 2anki-web typecheck`, `pnpm --filter 2anki-web lint`, `pnpm --filter 2anki-web test` all pass.

**Open questions**:
- Should the inline conversation appear in the user's conversations sidebar at `/chat` afterward, or stay ephemeral? Recommendation: ephemeral for slice 2 — fewer state edge cases, and the user came to convert a file, not to manage chat history. Revisit if users ask.
- If the user generates cards in the inline panel and clicks "Save as deck", do we count that toward `conversion_success` analytics? Recommendation: yes — it's the same outcome the upload pipeline produces, and conflating them keeps the funnel honest.
- Does the panel need its own loading skeleton, or is the existing `ChatPage` skeleton sufficient when rendered at the smaller width? Designer call before implementation.

**What we're NOT building**:
- Inline chat in `renderErrorState` — slice 1's deep-link stays; rewriting it would churn for no engagement signal.
- A floating chat button on `/upload`.
- Anonymous chat (still requires login + consent).
- Notion connection-error chat — that's slice 3.
- Ankify chat — slice 4.
- Server-side changes of any kind. `/api/chat/*` is unchanged.
