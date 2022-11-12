module.exports.up = (knex) => {
  return knex.schema.createTable('uploads', (table) => {
    table.increments('id').primary();
    table.integer('owner').notNullable();
    table.string('key').notNullable();
    table.string('filename');
  });
};

module.exports.down = (knex) => {
  return knex.schema.dropTable('uploads');
};
