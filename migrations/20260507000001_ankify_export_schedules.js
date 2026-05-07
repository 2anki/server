exports.up = function (knex) {
  return knex.schema.createTable('ankify_export_schedules', function (table) {
    table.increments('id').primary();
    table.integer('owner').notNullable();
    table.string('database_id').notNullable();
    table.string('time_of_day', 5).notNullable();
    table.string('timezone').notNullable();
    table.integer('date_range_days').nullable();
    table.boolean('enabled').notNullable().defaultTo(true);
    table.timestamp('last_run_at').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.unique('owner');
    table.index('enabled');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('ankify_export_schedules');
};
