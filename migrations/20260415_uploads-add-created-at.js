exports.up = function (knex) {
  return knex.schema.alterTable('uploads', function (table) {
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('uploads', function (table) {
    table.dropColumn('created_at');
  });
};
