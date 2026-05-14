# Spec: Dead Column Cleanup

Pure schema hygiene. No user-facing behavior changes. No trio review required.

---

## Outcome

Remove columns that are written but never read (or already dropped at the DB level), and regenerate Kanel types to match reality. Result: smaller schema surface, no misleading fields in generated types, reduced cognitive overhead for anyone reading the data layer.

## Background

A full schema audit (2026-05-14) identified these items as unused. Each was cross-referenced against `src/` and `web/src/` — none appear in any SELECT query, API response, or frontend component.

---

## Work items

### 1. Regenerate Kanel types (`pnpm kanel`)

Run `pnpm kanel` at repo root. This automatically:
- Removes `users.picture` from `src/data_layer/public/Users.ts` and `web/src/schemas/public/Users.ts` — the column was dropped by migration `20260519000000_drop_users_picture.js` but the generated types are stale
- Removes orphaned files `web/src/schemas/public/KiDecks.ts`, `web/src/schemas/public/KiFiles.ts` — no migrations exist for these tables; they are artifacts from an unmerged branch
- Removes `web/src/schemas/public/PatreonTokens.ts` — the `patreon_tokens` table was dropped by migration `20230731_delete_patreon_tokens_table.js` in 2023

No migration needed. Just regenerate and commit the diff.

### 2. Drop dead columns (one migration)

A single additive-drop migration removes all of the following. Each has been verified to have zero SELECT references in application code.

| Table | Column | Why it's dead |
|---|---|---|
| `notion_tokens` | `encrypted` | Set to `true` for all rows by a 2022 migration; never read back anywhere |
| `access_tokens` | `host` | Hardcoded default `'2anki.net'`; never filtered or selected on |
| `uploads` | `external_url` | Never populated in any INSERT; never read in any SELECT |
| `blocks` | `fetch` | Increment-only counter; no consumer reads it |

Migration file: `migrations/<timestamp>_drop_dead_columns.js`

```js
exports.up = function (knex) {
  return knex.schema
    .table('notion_tokens', (t) => t.dropColumn('encrypted'))
    .table('access_tokens', (t) => t.dropColumn('host'))
    .table('uploads', (t) => t.dropColumn('external_url'))
    .table('blocks', (t) => t.dropColumn('fetch'));
};

exports.down = function (knex) {
  return knex.schema
    .table('notion_tokens', (t) => t.boolean('encrypted').defaultTo(false))
    .table('access_tokens', (t) => t.string('host').defaultTo('2anki.net'))
    .table('uploads', (t) => t.string('external_url').nullable())
    .table('blocks', (t) => t.integer('fetch').defaultTo(0));
};
```

After the migration, run `pnpm kanel` again to remove these columns from the generated types.

### 3. `users.email_verified` — decision required before drop

The column is written by `UsersRepository.markEmailVerified()` but never read anywhere (no auth gate, no API response, no frontend reference). Two options:

- **Drop it** — if email verification is not planned. One-line addition to the migration above.
- **Build the read side** — spec out an email verification flow as a separate PR.

**This spec does not drop `users.email_verified`.** Alexander must decide first. If the decision is to drop, add `t.dropColumn('email_verified')` to the migration above and include it in the same PR.

### 4. `notion_tokens` OAuth columns — verify before deciding

These columns are written during OAuth token save but only `token` and `workspace_name` are ever selected:

- `notion_owner` — JSON blob from Notion's OAuth response; never read back
- `token_type` — always `'bearer'`; never read back
- `bot_id` — Notion bot ID; never read back
- `workspace_icon` — URL; never read back
- `workspace_id` — Notion workspace ID; never read back

**This spec does not drop these.** They may be useful if a "connected workspace" UI is planned. Confirm intent before including in a drop migration. If the decision is to keep, consider at minimum dropping `notion_owner` (it's a raw JSON blob that isn't typed or used).

---

## Scope

**In:**
- `pnpm kanel` regeneration (cleans up `users.picture`, `KiDecks`, `KiFiles`, `PatreonTokens`)
- Migration dropping `notion_tokens.encrypted`, `access_tokens.host`, `uploads.external_url`, `blocks.fetch`
- `pnpm kanel` re-run after migration to sync generated types

**Out:**
- `users.email_verified` — decision pending
- `notion_tokens` OAuth columns — decision pending
- Any behavior changes
- Any changes to `src/data_layer/public/` by hand (always Kanel-generated)

---

## Acceptance criteria

- [ ] `pnpm kanel` run; diff shows only removal of stale entries (no hand-edits)
- [ ] Migration created with correct `up`/`down`
- [ ] All four columns absent from generated types after second `pnpm kanel` run
- [ ] `/check` passes (server tsc + web typecheck + web vitest + web lint) — confirms no code referenced the dropped columns
- [ ] No application code changes required (if any file imports a dropped column, that is a bug in the audit and the column must be reinstated)

## Effort

S — all drops, no new logic. The only risk is a missed reference that `/check` will catch immediately.
