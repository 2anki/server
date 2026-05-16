exports.up = async (knex) => {
  const hasColumn = await knex.schema.hasColumn('users', 'stripe_customer_id');
  if (!hasColumn) {
    await knex.schema.table('users', (table) => {
      table.string('stripe_customer_id', 255).nullable();
    });
  }
};

exports.down = async (knex) => {
  const hasColumn = await knex.schema.hasColumn('users', 'stripe_customer_id');
  if (hasColumn) {
    await knex.schema.table('users', (table) => {
      table.dropColumn('stripe_customer_id');
    });
  }
};
