---
title: Connect Notion in 5 minutes
description: From signing in to your first deck downloaded.
---

This is the fastest way to get your Notion notes into Anki. You connect your Notion account once, pick a page, and 2anki builds the deck. No exports, no zip files.

<ol class="steps">
<li>

**Sign in with Notion.** Go to [2anki.net](https://2anki.net/), click **Sign up with Notion**, and grant 2anki access to the pages you want to convert. You can pick specific pages instead of your whole workspace — only what you share is visible to 2anki.

</li>
<li>

**Pick a page.** From the home screen, choose a page from the picker. You can search by title and the picker remembers your recent pages. Pages with toggle lists make the cleanest cards.

</li>
<li>

**Download your deck.** Click **Convert** on the page you picked. 2anki reads the page, turns toggles into flashcards, and gives you an `.apkg` file to download.

</li>
<li>

**Open it in Anki.** Double-click the `.apkg` on desktop or open it from the Files app on iOS or Android. See [Open your deck in Anki](/documentation/start-here/open-in-anki) for per-platform notes.

</li>
</ol>

## What if a page won't show up?

A few things to check:

- **You didn't share the page with the 2anki integration.** Open the page in Notion, click **Share**, then **Add connections**, and pick 2anki. Notion only shows 2anki the pages you explicitly share.
- **The page is in a workspace 2anki isn't connected to.** Sign out and back in, then choose the right workspace when Notion asks.
- **The page just got created.** The picker caches pages for a few minutes. Hit refresh on the picker or wait, then try again.

If a page shows up but conversion fails, see [Common problems](/documentation/help/common-problems).

## Notion vs uploading a file

Connecting Notion is the recommended path because edits in Notion can flow back into your Anki deck — see [How sync works](/documentation/sync/how-it-works). If you'd rather drop in a PDF or a Notion HTML export, see [Upload a file instead](/documentation/start-here/upload-a-file).
