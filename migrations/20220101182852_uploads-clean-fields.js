module.exports.up = (knex) => {
  return knex.schema.table('uploads', (table) => {
    table.dropColumn('type');
  });
};

module.exports.down = (knex) => {
  return knex.schema.table('uploads', (table) => {
    table.string('type');
  });
};
