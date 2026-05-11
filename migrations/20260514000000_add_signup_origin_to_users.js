exports.up = function (knex) {
  return knex.schema.alterTable('users', function (table) {
    table.text('signup_origin').nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('users', function (table) {
    table.dropColumn('signup_origin');
  });
};
