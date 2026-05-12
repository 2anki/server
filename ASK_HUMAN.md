# Open questions for human review

Items flagged during the redesign that need Al's input before proceeding.

---

## Flagged upfront (Phase 1)

1. **PricingPage** — Hard constraint: 100-card limit and tier structure must not change. This page has 22 hardcoded hex values for a custom gold/amber theme (lifetime plan styling). Proposed changes would be CSS-only tokenization — no copy or pricing changes. Should I proceed with just tokenizing the colors, or leave this page untouched?

2. **SuccessfulCheckout** — Billing-adjacent page. Same treatment: will describe proposed changes before implementing.

## Resolved

3. **DeleteAccountPage** — Reviewed and updated. The two-step confirmation pattern (click once for "Delete", click again for "I am sure!") is a good UX pattern — kept as-is. Only changed the raw Notion URL to descriptive link text.
