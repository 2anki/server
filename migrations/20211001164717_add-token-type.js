module.exports.up = (knex) => {
  return knex.schema.table('access_tokens', (table) => {
    table.string('host').defaultTo('2anki.net').notNullable();
  });
};

module.exports.down = (knex) => {
  return knex.schema.table('access_tokens', (table) => {
    table.dropColumn('host');
  });
};
