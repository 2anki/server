exports.up = function (knex) {
  return knex.schema.createTable('ankify_sync_conflicts', function (table) {
    table.increments('id').primary();
    table.integer('owner').notNullable();
    table.integer('ankify_client_id').notNullable();
    table.integer('subscription_id').nullable();
    table.string('source_id').notNullable();
    table.bigInteger('anki_note_id').notNullable();
    table.string('kind', 32).notNullable();
    table.timestamp('notion_last_edited_at').nullable();
    table.bigInteger('anki_modified_at').nullable();
    table.jsonb('notion_snapshot').nullable();
    table.jsonb('anki_snapshot').nullable();
    table.string('status', 16).notNullable().defaultTo('pending');
    table.string('resolution', 32).nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('resolved_at').nullable();
    table.unique(['ankify_client_id', 'source_id', 'status'], {
      indexName: 'ankify_sync_conflicts_unique_pending',
      predicate: knex.whereRaw("status = 'pending'"),
    });
    table.index(['owner', 'status']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('ankify_sync_conflicts');
};
