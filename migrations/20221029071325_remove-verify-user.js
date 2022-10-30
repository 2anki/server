exports.up = function (knex) {
  return knex.schema.table('users', (table) => {
    table.dropColumn('verification_token');
    table.dropColumn('verified');
  });
};

module.exports.down = (knex) => {
  return knex.schema.table('users', (table) => {
    table.boolean('verified').defaultTo(true);
    table.string('verification_token');
  });
};
