exports.up = function (knex) {
  return knex.schema.createTable('ankify_sync_logs', function (table) {
    table.increments('id').primary();
    table.integer('owner').notNullable();
    table.string('kind', 32).notNullable();
    table.string('status', 16).notNullable();
    table.text('message').notNullable();
    table.jsonb('payload').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.index(['owner', 'created_at']);
    table.index('status');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('ankify_sync_logs');
};
