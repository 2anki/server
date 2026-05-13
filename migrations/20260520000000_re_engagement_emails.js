exports.up = (knex) =>
  knex.schema.createTable('re_engagement_emails', (table) => {
    table.increments('id').primary();
    table.integer('user_id').references('id').inTable('users').notNullable();
    table
      .timestamp('sent_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table.string('token', 64).notNullable().unique();
    table.index(['user_id']);
  });

exports.down = (knex) =>
  knex.schema.dropTableIfExists('re_engagement_emails');
