/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTableIfNotExists('public_templates', function (table) {
    table.increments('id').primary();
    table.string('owner').notNullable();
    table.string('name').notNullable();
    table.text('description').nullable();
    table.json('payload').notNullable();
    table.json('preview_data').nullable();
    table.json('tags').nullable();
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('public_templates');
};
