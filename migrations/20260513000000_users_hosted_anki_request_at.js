exports.up = function (knex) {
  return knex.schema.alterTable('users', function (table) {
    table.timestamp('hosted_anki_requested_at', { useTz: true }).nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('users', function (table) {
    table.dropColumn('hosted_anki_requested_at');
  });
};
