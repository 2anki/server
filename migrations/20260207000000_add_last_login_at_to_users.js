module.exports.up = (knex) => {
  return knex.schema.table('users', (table) => {
    table.timestamp('last_login_at').defaultTo(null);
  });
};

module.exports.down = (knex) => {
  return knex.schema.table('users', (table) => {
    table.dropColumn('last_login_at');
  });
};
