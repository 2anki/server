exports.up = function (knex) {
  return knex.schema.createTable(
    'ankify_notion_subscriptions',
    function (table) {
      table.increments('id').primary();
      table.integer('owner').notNullable();
      table.integer('ankify_client_id').notNullable();
      table.string('notion_page_id').notNullable();
      table.boolean('enabled').notNullable().defaultTo(true);
      table.timestamp('last_polled_at').nullable();
      table.timestamp('last_synced_at').nullable();
      table.text('last_error').nullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.unique(['owner', 'notion_page_id']);
      table.index('ankify_client_id');
      table.index(['enabled', 'last_polled_at']);
    }
  );
};

exports.down = function (knex) {
  return knex.schema.dropTable('ankify_notion_subscriptions');
};
