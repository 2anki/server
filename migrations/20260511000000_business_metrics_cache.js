exports.up = async function (knex) {
  await knex.schema.createTable('business_metrics_cache', function (table) {
    table.string('metric_key', 64).primary();
    table.jsonb('value').notNullable();
    table.timestamp('cached_at', { useTz: true }).notNullable();
    table.timestamp('expires_at', { useTz: true }).notNullable();
    table.index(['expires_at'], 'business_metrics_cache_expires_at_idx');
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('business_metrics_cache');
};
