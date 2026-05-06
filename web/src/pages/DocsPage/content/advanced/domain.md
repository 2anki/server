---
title: Domain
description: Core concepts used throughout 2anki.net
---

These are the nouns that come up in the code, the API, and the rest of the documentation.

- **Users** — accounts that own uploads, favourites, and settings.
- **Uploads** — an uploaded document or archive. Can be a `.zip`, `.html`, `.md`, `.pdf`, `.ppt(x)`, `.doc(x)`, `.xlsx`, or `.csv`.
- **Jobs** — the background conversion that turns an upload into a deck. Has a status (pending, running, done, failed).
- **Notes** — the Anki-level records that become flashcards on import.
- **Decks** — a named collection of notes. One upload usually produces one deck.
- **Flashcards** — a specific front/back pair. 2anki.net supports basic, reversed, cloze, and input cards.
- **Templates** — the HTML/CSS layout used to render a flashcard in Anki.
- **CardOptions** — user-configurable knobs that control how an upload is parsed (toggle behaviour, bold-as-input, cloze detection, etc.).
- **Rules** — user-defined transformations applied while parsing. Advanced users can use these to override the default toggle mapping.
- **Settings** — account-level defaults that feed into every job.
- **Downloads** — the resulting Anki package (`.apkg`) delivered at the end of a job.
