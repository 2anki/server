module.exports.up = (knex) => {
  return knex.schema.createTable('feedback', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('email').notNullable();
    table.text('message').notNullable();
    table.json('attachments');
    table.boolean('is_acknowledged').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

module.exports.down = (knex) => {
  return knex.schema.dropTable('feedback');
};
