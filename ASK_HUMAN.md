# Open questions for human review

All items resolved — no blockers remain.

---

## Resolved

1. **PricingPage** — All 22 hardcoded gold/amber hex values tokenized into `--color-gold-*` CSS custom properties. Zero copy or pricing changes. Theme system added (light/dark/gold) so the gold palette adapts automatically.

2. **SuccessfulCheckout** — No dedicated CSS; uses shared.module.css which is already fully tokenized. No changes needed.

3. **DeleteAccountPage** — Two-step confirmation pattern kept as-is. Raw Notion URL changed to descriptive link text.
