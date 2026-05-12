exports.up = function (knex) {
  return knex.schema.createTable('homepage_showcase', function (table) {
    table.integer('id').primary().defaultTo(1);
    table.text('page_title').notNullable();
    table.jsonb('notion_blocks').notNullable();
    table.jsonb('anki_cards').notNullable();
    table.timestamp('populated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('homepage_showcase');
};
