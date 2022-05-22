module.exports.up = function (knex) {
  return knex.schema.createTable('favorites', function (table) {
    table.integer('owner').references('id').inTable('users').notNullable();
    table.text('object_id').notNullable();
  });
};

module.exports.down = function (knex) {
  return knex.schema.dropTable('favorites');
};
