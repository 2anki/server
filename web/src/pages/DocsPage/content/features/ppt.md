---
title: PPT / PPTX
description: PowerPoint support on 2anki.net
---

2anki.net accepts PowerPoint decks (`.ppt` and `.pptx`). Each slide becomes one side of a flashcard, following the same page-pairing rules as [PDF uploads](/documentation/features/pdf):

1. Upload your `.ppt` or `.pptx` file.
2. The server converts the deck to PDF using LibreOffice.
3. The PDF is rendered to images — slide 1 is the front of card 1, slide 2 is the back, and so on.
4. Download the APKG and import it into Anki.

For large presentations, subscribers can enable Claude AI generation on the upload page to produce structured flashcards instead of image pairs. See the [PDF page](/documentation/features/pdf) for details.
