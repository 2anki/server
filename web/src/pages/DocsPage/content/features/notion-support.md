---
title: Notion Support
description: Notion block types supported by 2anki.net
---

2anki.net supports a large subset of the [Notion block API](https://developers.notion.com/reference/block).
Toggle blocks are the primary way to build flashcards — the summary becomes the front and the children become the back.

## Implemented

These blocks are rendered in the exported deck.

- [x] [Paragraph](https://developers.notion.com/reference/block#paragraph-blocks)
- [x] [Heading 1 / 2 / 3](https://developers.notion.com/reference/block#heading-one-blocks)
- [x] [Bulleted list item](https://developers.notion.com/reference/block#bulleted-list-item-blocks)
- [x] [Numbered list item](https://developers.notion.com/reference/block#numbered-list-item-blocks)
- [x] [To-do](https://developers.notion.com/reference/block#to-do-blocks)
- [x] [Toggle](https://developers.notion.com/reference/block#toggle-blocks) — front/back of a flashcard
- [x] [Quote](https://developers.notion.com/reference/block#quote-blocks)
- [x] [Callout](https://developers.notion.com/reference/block#callout-blocks)
- [x] [Code](https://developers.notion.com/reference/block#code-blocks)
- [x] [Equation](https://developers.notion.com/reference/block#equation-blocks) (KaTeX)
- [x] [Divider](https://developers.notion.com/reference/block#divider-blocks)
- [x] [Image](https://developers.notion.com/reference/block#image-blocks)
- [x] [Video](https://developers.notion.com/reference/block#video-blocks)
- [x] [Audio](https://developers.notion.com/reference/block#audio-blocks)
- [x] [File](https://developers.notion.com/reference/block#file-blocks)
- [x] [PDF embed](https://developers.notion.com/reference/block#pdf-blocks)
- [x] [Embed](https://developers.notion.com/reference/block#embed-blocks)
- [x] [Bookmark](https://developers.notion.com/reference/block#bookmark-blocks)
- [x] [Link to page](https://developers.notion.com/reference/block#link-to-page-blocks)
- [x] [Child page](https://developers.notion.com/reference/block#child-page-blocks)
- [x] [Column list and column](https://developers.notion.com/reference/block#column-list-and-column-blocks)

## Unsupported

These blocks are skipped or rendered as a fallback.

- [ ] [Table](https://developers.notion.com/reference/block#table-blocks) and [Table row](https://developers.notion.com/reference/block#table-row-blocks)
- [ ] [Table of contents](https://developers.notion.com/reference/block#table-of-contents-blocks)
- [ ] [Child database](https://developers.notion.com/reference/block#child-database-blocks)
- [ ] [Breadcrumb](https://developers.notion.com/reference/block#breadcrumb-blocks)
- [ ] [Link preview](https://developers.notion.com/reference/block#link-preview-blocks)
- [ ] [Template](https://developers.notion.com/reference/block#template-blocks)
- [ ] [Synced block](https://developers.notion.com/reference/block#synced-block-blocks)

Missing a block you need? [Open an issue](https://github.com/2anki/2anki.net/issues).
