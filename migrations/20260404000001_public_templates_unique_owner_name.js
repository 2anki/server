exports.up = function (knex) {
  return knex.schema.table('public_templates', function (table) {
    table.unique(['owner', 'name']);
  });
};

exports.down = function (knex) {
  return knex.schema.table('public_templates', function (table) {
    table.dropUnique(['owner', 'name']);
  });
};
