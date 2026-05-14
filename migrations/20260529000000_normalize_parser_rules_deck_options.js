// The /rules UI no longer exposes deck-type chips other than `page` and
// `database`, and drops `column_list`, `bulleted_list_item`,
// `numbered_list_item`, and `quote` from sub-deck chips. Normalise existing
// rows so saved values match what the UI can express.

const VALID_DECK_TYPES = ['page', 'database'];
const VALID_SUB_DECK_TYPES = [
  'child_page',
  'child_database',
  'toggle',
  'heading_1',
  'heading_2',
  'heading_3',
];

exports.up = async (knex) => {
  await knex.raw(
    `UPDATE parser_rules SET deck_is = ? WHERE deck_is IS DISTINCT FROM ?`,
    [VALID_DECK_TYPES.join(','), VALID_DECK_TYPES.join(',')]
  );

  const rows = await knex('parser_rules')
    .select('id', 'sub_deck_is')
    .whereNotNull('sub_deck_is');

  for (const row of rows) {
    const filtered = (row.sub_deck_is || '')
      .split(',')
      .map((v) => v.trim())
      .filter((v) => VALID_SUB_DECK_TYPES.includes(v));
    const next = filtered.join(',');
    if (next !== row.sub_deck_is) {
      await knex('parser_rules').where({ id: row.id }).update({
        sub_deck_is: next,
      });
    }
  }
};

exports.down = async () => {
  // No-op. The previous values are not recoverable; the data was dormant.
};
