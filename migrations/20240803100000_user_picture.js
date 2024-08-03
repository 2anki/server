module.exports.up = (knex) => {
  return knex.schema.table('users', (table) => {
    table.string('picture').defaultTo(null);
  });
};

module.exports.down = (knex) => {
  return knex.schema.table('users', (table) => {
    table.dropColumn('picture');
  });
};
