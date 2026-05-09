exports.up = async function (knex) {
  await knex.schema.createTable('request_logs', function (table) {
    table.bigIncrements('id').primary();
    table.string('method', 8).notNullable();
    table.text('route').notNullable();
    table.smallint('status_code').notNullable();
    table.integer('duration_ms').notNullable();
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.index(['created_at'], 'request_logs_created_at_idx');
    table.index(['route', 'created_at'], 'request_logs_route_created_at_idx');
  });

  await knex.schema.createTable('outbound_call_logs', function (table) {
    table.bigIncrements('id').primary();
    table.string('service', 32).notNullable();
    table.text('endpoint').notNullable();
    table.smallint('status_code').nullable();
    table.integer('duration_ms').notNullable();
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.index(['created_at'], 'outbound_call_logs_created_at_idx');
    table.index(
      ['service', 'created_at'],
      'outbound_call_logs_service_created_at_idx'
    );
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('outbound_call_logs');
  await knex.schema.dropTableIfExists('request_logs');
};
