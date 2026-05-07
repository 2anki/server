exports.up = function (knex) {
  return knex.schema.createTable('ankify_sync_mappings', function (table) {
    table.increments('id').primary();
    table
      .integer('ankify_client_id')
      .notNullable()
      .references('id')
      .inTable('ankify_clients')
      .onDelete('CASCADE');
    table.string('source_id').notNullable();
    table.string('source_type', 32).notNullable();
    table.bigInteger('anki_note_id').notNullable();
    table.string('deck_name').notNullable();
    table.timestamp('last_synced_at').defaultTo(knex.fn.now());
    table.unique(['ankify_client_id', 'source_id']);
    table.index('ankify_client_id');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('ankify_sync_mappings');
};
