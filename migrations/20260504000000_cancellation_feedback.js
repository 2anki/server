exports.up = function (knex) {
  return knex.schema.createTable('cancellation_feedback', function (table) {
    table.increments('id').primary();
    table.string('owner').notNullable();
    table.string('reason').notNullable();
    table.text('comment').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.index('owner');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('cancellation_feedback');
};
