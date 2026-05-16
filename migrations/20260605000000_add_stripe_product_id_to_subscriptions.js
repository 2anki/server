exports.up = async (knex) => {
  await knex.schema.table('subscriptions', (table) => {
    table.string('stripe_product_id', 255).nullable();
  });
};

exports.down = async (knex) => {
  await knex.schema.table('subscriptions', (table) => {
    table.dropColumn('stripe_product_id');
  });
};
