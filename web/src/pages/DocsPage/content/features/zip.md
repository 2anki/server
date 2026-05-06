---
title: ZIP
description: ZIP uploads on 2anki.net
---

Zip archives are the recommended format when you have a single Notion or Obsidian export that includes media. 2anki.net walks the archive, detects every supported file inside it, and builds one deck per document.

## What goes inside

Any combination of the formats 2anki.net already supports:

- [HTML](/documentation/features/html) (`.html`, `.htm`)
- [Markdown](/documentation/features/markdown) (`.md`)
- [CSV](/documentation/features/csv) (`.csv`)
- [XLSX](/documentation/features/xlsx) (`.xlsx`)
- [PDF](/documentation/features/pdf) (`.pdf`)
- [PPT / PPTX](/documentation/features/ppt)
- Images and audio referenced from your documents

The archive itself must end in `.zip`.

## Notion exports

When exporting from Notion, pick **HTML** as the export format and tick **Include subpages**. Notion will produce a `.zip` with the HTML files and an `assets/` directory — upload that file as-is.

If your browser automatically unzips downloads (Safari does this by default), your media can end up detached from the HTML. Turn off that behaviour or re-zip the folder before uploading.
