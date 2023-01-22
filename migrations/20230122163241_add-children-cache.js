/**
 * @param { import("knex").Knex } knex
 * @returns {Knex.SchemaBuilder}
 */
exports.up = function (knex) {
  return knex.schema.createTable('blocks', function (table) {
    table.increments('id').unique().primary();
    table.string('owner', 255).notNullable();
    table.string('object_id', 255).unique().notNullable();
    table.json('payload').notNullable();
    table.integer('fetch').notNullable().defaultTo(0);
    table.timestamp('created_at').notNullable();
    table.timestamp('last_edited_time').notNullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns {Knex.SchemaBuilder}
 */
exports.down = function (knex) {
  return knex.schema.dropTable('blocks');
};
