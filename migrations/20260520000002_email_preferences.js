exports.up = (knex) =>
  knex.schema.createTable('email_preferences', (table) => {
    table
      .integer('user_id')
      .primary()
      .references('id')
      .inTable('users')
      .notNullable();
    table.boolean('marketing_opt_out').notNullable().defaultTo(false);
    table
      .timestamp('updated_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
  });

exports.down = (knex) =>
  knex.schema.dropTableIfExists('email_preferences');
