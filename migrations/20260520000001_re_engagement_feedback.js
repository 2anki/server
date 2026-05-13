exports.up = (knex) =>
  knex.schema.createTable('re_engagement_feedback', (table) => {
    table.increments('id').primary();
    table
      .integer('email_id')
      .references('id')
      .inTable('re_engagement_emails')
      .notNullable();
    table.string('stopped_reason', 64).notNullable();
    table.string('content_type', 64).notNullable();
    table.text('comment').nullable();
    table
      .timestamp('created_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
  });

exports.down = (knex) =>
  knex.schema.dropTableIfExists('re_engagement_feedback');
