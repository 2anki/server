exports.up = (knex) =>
  knex.schema.createTable('chat_messages', (t) => {
    t.increments('id').primary();
    t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.varchar('role', 16).notNullable();
    t.text('content').notNullable();
    t.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.index(['user_id', 'created_at']);
  });

exports.down = (knex) =>
  knex.schema.dropTable('chat_messages');
