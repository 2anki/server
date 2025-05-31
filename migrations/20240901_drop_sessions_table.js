exports.up = async function (knex) {
  return knex.schema.dropTableIfExists('sessions');
};

exports.down = async function (knex) {
  return knex.schema.createTable('sessions', (table) => {
    table.increments('id').primary();
    table.string('userId', 255).notNullable();
    table.jsonb('data').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};
