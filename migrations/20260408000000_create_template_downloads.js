exports.up = function (knex) {
  return knex.schema.createTable('template_downloads', (table) => {
    table.increments('id').primary();
    table.string('template_id').notNullable();
    table.timestamp('downloaded_at').defaultTo(knex.fn.now());
    table.index('template_id');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('template_downloads');
};
