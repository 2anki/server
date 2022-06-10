module.exports.up = function (knex) {
  return knex.schema.table('users', function (table) {
    table.string('reset_token');
  });
};

module.exports.down = function (knex) {
  return knex.schema.table('users', function (table) {
    table.dropColumn('reset_token');
  });
};
