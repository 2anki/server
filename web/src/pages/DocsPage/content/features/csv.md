---
title: CSV
description: CSV support on 2anki.net
---

2anki.net accepts comma-separated value files (`.csv`) for simple front/back flashcards.

## Format

The first column is the front, the second column is the back. Any additional columns are ignored.

```csv
What is the capital of France?,Paris
What is the capital of Albania?,Tirana
```

Fields containing commas or newlines should be wrapped in double quotes:

```csv
"What is, and what should never be?","A song by Led Zeppelin."
```

## Tips

- Export directly from spreadsheet apps (Numbers, Excel, Google Sheets) using the "Export as CSV" option.
- To keep formatting (images, styling, cloze), use [HTML](/documentation/features/html) instead.
- CSV files may also be bundled inside a [ZIP upload](/documentation/features/zip) alongside other supported formats.
