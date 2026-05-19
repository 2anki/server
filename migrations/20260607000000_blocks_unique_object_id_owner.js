exports.up = function (knex) {
  return knex.schema.alterTable('blocks', function (table) {
    table.dropUnique(['object_id']);
    table.unique(['object_id', 'owner']);
  });
};

exports.down = function (knex) {
  return knex('blocks')
    .select('object_id')
    .groupBy('object_id')
    .havingRaw('COUNT(*) > 1')
    .first()
    .then(function (duplicate) {
      if (duplicate) {
        throw new Error(
          'Cannot rollback: duplicate object_id values exist across different owners'
        );
      }
      return knex.schema.alterTable('blocks', function (table) {
        table.dropUnique(['object_id', 'owner']);
        table.unique(['object_id']);
      });
    });
};
