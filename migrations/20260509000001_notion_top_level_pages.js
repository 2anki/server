exports.up = function (knex) {
  return knex.schema.createTable('notion_top_level_pages', function (table) {
    table.integer('owner').notNullable();
    table.string('notion_page_id').notNullable();
    table.text('title').notNullable();
    table.jsonb('icon').nullable();
    table.text('url').nullable();
    table.text('parent_type').notNullable();
    table.timestamp('last_edited_time').nullable();
    table.timestamp('cached_at').notNullable().defaultTo(knex.fn.now());
    table.primary(['owner', 'notion_page_id']);
    table.index(['owner', 'cached_at']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('notion_top_level_pages');
};
