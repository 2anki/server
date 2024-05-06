module.exports.up = async function (knex) {
  return knex.schema.createTable('subscriptions', function (table) {
    table.increments('id');
    table.string('email', 255).unique().notNullable();
    table.boolean('active').defaultTo(false).notNullable();
    table.json('payload').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

module.exports.down = async function (knex) {
  return knex.schema.dropTable('subscriptions');
};
