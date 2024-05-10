module.exports.up = async function (knex) {
  return knex.schema.table('subscriptions', function (table) {
    table.string('linked_email', 255).unique().nullable();
  });
};

module.exports.down = async function (knex) {
  return knex.schema.table('subscriptions', (table) => {
    table.dropColumn('linked_email', 255).unique().nullable();
  });
};
