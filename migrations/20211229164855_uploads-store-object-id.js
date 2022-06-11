module.exports.up = (knex) => {
  return knex.schema.table('uploads', (table) => {
    table.string('object_id');
  });
};

module.exports.down = (knex) => {
  return knex.schema.table('uploads', (table) => {
    table.dropColumn('object_id');
  });
};
