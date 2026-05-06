---
title: XLSX
description: Excel support on 2anki.net
---

2anki.net accepts Excel workbooks (`.xlsx`). Under the hood, the workbook is converted to HTML and each row becomes a flashcard.

## Format

Use the first sheet. Per row:

- **Column A** — front of the card
- **Column B** — back of the card

Additional columns are ignored.

## Tips

- Basic text formatting (bold, italic) is preserved through the HTML conversion.
- For richer content (images, cloze deletions, custom styling), use [HTML](/documentation/features/html) directly.
- Only `.xlsx` is supported; older `.xls` files should be re-saved as `.xlsx` before uploading.
