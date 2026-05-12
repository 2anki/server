exports.up = function (knex) {
  return knex.schema.alterTable('users', function (table) {
    table.boolean('ankify_welcome_seen').notNullable().defaultTo(false);
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('users', function (table) {
    table.dropColumn('ankify_welcome_seen');
  });
};
