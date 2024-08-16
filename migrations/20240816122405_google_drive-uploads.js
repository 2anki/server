// migrations/20240816122405_google_drive_uploads.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('google_drive_uploads', function(table) {
    table.string('id').primary();
    table.string('description').notNullable();
    table.string('embedUrl').notNullable();
    table.string('iconUrl').notNullable();
    table.bigInteger('lastEditedUtc').notNullable();
    table.string('mimeType').notNullable();
    table.string('name').notNullable().notNullable();
    table.string('organizationDisplayName').notNullable();
    table.string('parentId').notNullable();
    table.string('serviceId').notNullable();
    table.bigInteger('sizeBytes').notNullable();
    table.string('type').notNullable();
    table.string('url').notNullable().notNullable();
    table.integer('owner').notNullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('google_drive_uploads');
};
