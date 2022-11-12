module.exports.up = (knex) => {
  return knex.schema.table('users', (table) => {
    table.string('verification_token');
    table.boolean('verified').defaultTo(false);
  });
};

module.exports.down = (knex) => {
  return knex.schema.table('users', (table) => {
    table.dropColumn('verification_token');
    table.dropColumn('verified');
  });
};
