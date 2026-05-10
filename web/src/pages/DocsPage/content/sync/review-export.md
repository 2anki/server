---
title: Send your reviews back to Notion
description: Push how often you got each card right back into your Notion database.
---

:::note
This is an early-access feature for **Lifetime** supporters only. It builds on [Sync](/documentation/sync/how-it-works), which is itself in private alpha. If you'd like to be on the list, email [alexander@alemayhu.com](mailto:alexander@alemayhu.com).
:::

Review export pushes your Anki review history back into a Notion database. After a study session, you'll see — for each card — how many times you got it right, how many times you got it wrong, and when you last saw it.

## What you'll see in Notion

Each card maps to one row in the database you pick. After a sync runs, the row's properties update with:

- **Reviews** — total times you've seen the card.
- **Lapses** — times you forgot.
- **Ease** — Anki's ease factor for the card.
- **Last review** — when you last studied it.
- **Due** — when Anki wants to show it next.

Notion stays your source of truth for the question and answer. 2anki only writes the review numbers — it doesn't touch your card content.

## Turning it on

You'll do this from the Ankify dashboard once you have access:

1. Make sure the source page is already syncing — see [How sync works](/documentation/sync/how-it-works).
2. In the Notion database that holds the cards, add the required properties (below).
3. From the Ankify dashboard, open the page's settings and toggle **Export reviews to Notion**.
4. Pick the database you want the data written to.
5. Run a sync. After your next Anki study session, the database rows fill in.

## Required Notion properties

The database needs these properties. Names must match exactly. Types in parentheses.

| Property | Type |
|---|---|
| Reviews | Number |
| Lapses | Number |
| Ease | Number |
| Last review | Date |
| Due | Date |

You can have other properties too — 2anki only writes the ones above.

:::warning
If a property is missing or the wrong type, the sync skips it silently for that row. Check the Ankify dashboard's run log to see which rows updated.
:::

## Limits

- Review export runs at the same five-minute cadence as sync. It isn't real-time.
- Only cards 2anki originally created from that Notion page are tracked. Cards you added by hand in Anki aren't matched back.
- If you delete the Notion row, the matching Anki card stays — Anki is the source of truth for what you study, Notion is the source of truth for what you wrote.

If a row isn't updating, see [When sync gets stuck](/documentation/sync/troubleshooting).
