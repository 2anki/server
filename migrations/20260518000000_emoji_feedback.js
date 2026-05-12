exports.up = (knex) =>
  knex.schema.createTable('emoji_feedback', (table) => {
    table.increments('id').primary();
    table.integer('rating').notNullable();
    table.text('comment').nullable();
    table.string('page', 255).notNullable();
    table
      .timestamp('created_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
  });

exports.down = (knex) => knex.schema.dropTableIfExists('emoji_feedback');
