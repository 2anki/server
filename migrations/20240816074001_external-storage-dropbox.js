module.exports.up = (knex) => {
  return knex.schema.createTable('dropbox_uploads', (table) => {
    table.increments('id').primary();
    table.integer('bytes').notNullable();
    table.string('icon').notNullable();
    table.string('dropbox_id').notNullable();
    table.boolean('isDir').notNullable();
    table.string('link').notNullable();
    table.string('linkType').notNullable();
    table.string('name').notNullable();
  });
};

module.exports.down = (knex) => {
  return knex.schema.dropTable('dropbox_uploads');
};
