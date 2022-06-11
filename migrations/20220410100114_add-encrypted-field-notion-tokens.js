module.exports.up = (knex) => {
  return knex.schema.table('notion_tokens', (table) => {
    table.boolean('encrypted').defaultTo(false);
  });
};

module.exports.down = (knex) => {
  return knex.schema.table('notion_tokens', (table) => {
    table.dropColumn('encrypted');
  });
};
