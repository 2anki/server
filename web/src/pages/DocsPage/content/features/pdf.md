---
title: PDF
description: PDF support on 2anki.net
---

There are two ways to turn PDFs into Anki decks on 2anki.net.

## 1. Page-to-flashcard conversion (default)

Each pair of consecutive pages becomes one flashcard.

1. Upload your PDF file.
2. Odd-numbered pages (1, 3, 5…) become card fronts; even-numbered pages become the backs.
3. Pages are rendered to images locally so they work on any Anki client.
4. Download the APKG and import into Anki.

This method keeps your PDF contents on our servers only for the short processing window and does not send content to third-party AI services.

**Limits**

- Free users: up to 100 pages per PDF.
- Paying subscribers: 1000+ pages.

Best suited for PDFs already organised as Q&A pairs (e.g. a question on one page and the answer on the next).

## 2. AI-powered flashcard generation (paying feature)

Paying subscribers can opt in to the Claude AI generation flow from the upload page. The server sends your document to Anthropic's Claude model, which extracts topics and produces structured flashcards (basic, cloze, and input cards).

- Toggle "✨ Generate flashcards with Claude AI" on `/upload` to enable it for your next upload.
- Large PDFs are chunked automatically so very long documents are supported.
- See the [privacy policy](/documentation/misc/privacy-policy) for a list of processors involved.

If you have sensitive content, stick with method 1 — it does not leave our infrastructure.
