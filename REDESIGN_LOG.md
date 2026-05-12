# Redesign log

Per-screen before/after scoring using the 6-question design review framework.

Scoring: (1) Primary action obvious? (2) Hierarchy clear or competing? (3) System data in user language? (4) Destructive styles reserved? (5) Whitespace generous? (6) Borders earning their place?

Verdict: ship it / minor changes / rethink

---

## Screen 1: SearchPage (`/notion`)

**Before (3/5):**
1. Primary action: search input is prominent but viewport-relative sizing (2.4vw) breaks at extremes
2. Hierarchy: search bar + results + actions all at similar visual weight
3. System data: Notion object types exposed, but titles are user-facing
4. Destructive styles: N/A (no destructive actions)
5. Whitespace: adequate but result entries cramped (1rem padding, no hover)
6. Borders: search input uses bottom-border only (good); result entries have no separation

**After (4/5):**
1. Search input uses type-scale tokens (text-2xl mobile, text-3xl desktop) — predictable
2. Result entries get hover states, clear action button hierarchy (rounded bg on hover)
3. Copy tightened: "Notion" / "Get started" headings; ConnectNotion cards simplified
4. N/A
5. Result entries get padding + rounded hover area; sticky bar has more breathing room
6. Underline-only search input preserved; entries separated by hover interaction, not lines

**Verdict:** ship it

---

## Screen 2: UploadPage (`/upload`)

**Before (3/5):**
1. Primary action: drop zone is clear, "Click to convert" CTA is inside it
2. Hierarchy: settings icon only appears after interaction — smart but not discoverable
3. System data: file type list was a dynamically computed comma blob
4. Destructive styles: N/A
5. Whitespace: drop zone has generous padding; helper text is dense
6. Borders: drop zone uses dashed border (appropriate for drop target)

**After (4/5):**
1. Same — drop zone primary action preserved
2. Same — settings interaction preserved
3. File types listed as readable sentence; helper text broken into distinct lines
4. N/A
5. Helper text spaced as individual paragraphs
6. Drop zone dashed border preserved; buttons shifted to radius-md with shadow

**Verdict:** ship it

---

## Screen 3: DownloadsPage (`/downloads`)

**Before (3/5):**
1. Primary action: refresh button + table actions compete
2. Hierarchy: title/subtitle clear, but table vs. empty state not well differentiated
3. System data: job statuses mapped to user-friendly tags — good
4. Destructive styles: delete button uses red (#b91c1c) — appropriate as neutral-at-rest
5. Whitespace: table rows cramped at 12px padding
6. Borders: card + table borders double up

**After (4/5):**
1. Refresh button secondary (outline), table actions appropriately small
2. Card container uses shadow instead of border — cleaner visual separation
3. All hardcoded colors tokenized — consistent semantic meaning
4. Delete button neutral at rest, red on hover only (per design framework)
5. Same padding, but shadow-based cards feel more spacious
6. Borders replaced with shadows; only table rows have light dividers

**Verdict:** ship it

---

## Screen 4: PreviewPage (`/preview/:id`)

**Before (3/5):**
1. Primary action: content preview is the whole point — well centered
2. Hierarchy: back link → title → preview content — clear
3. System data: block rendering is user-facing content — good
4. Destructive styles: N/A
5. Whitespace: preview area has solid padding
6. Borders: preview article has border + radius — works but heavy

**After (4/5):**
1. Same
2. Same
3. Same
4. N/A
5. Same
6. Preview surface shifted from border to shadow-sm with radius-lg — lighter feel

**Verdict:** ship it

---

## Screen 5: HomePage (`/`)

**Before (3/5):**
1. Primary action: upload form is embedded — clear but competes with hero text
2. Hierarchy: huge hero title (text-8xl) dominates, then subtitle, then form — good
3. System data: N/A
4. Destructive styles: N/A
5. Whitespace: hero has good top padding; content section adequate
6. Borders: none on hero; form section has its own treatment

**After (4/5):**
1. Same — form placement preserved
2. Hero gradient uses brand color tokens instead of hardcoded purple/blue
3. Copy tightened: "The simplest way to turn your notes into beautiful Anki decks"
4. N/A
5. Same
6. Same

**Copy changes:**
- Hero subtitle: was "We are making it the easiest and fastest way..." → "The simplest way to turn your notes into beautiful Anki decks."
- Section header: "New here?" → "How it works"
- Video headings: "Conversion using the Notion integration" → "Convert with the Notion integration"
- Removed "Happy learning!" trailing paragraph

**Verdict:** ship it

---

## Translation needs

- `upload.page.title` in `app.document.json` — no change needed (English only)
- No Norwegian/locale strings were found in the modified screens
