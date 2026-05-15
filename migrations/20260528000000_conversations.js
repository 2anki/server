exports.up = async (knex) => {
  await knex.schema.createTable('conversations', (t) => {
    t.increments('id').primary();
    t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.text('title').notNullable();
    t.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.timestamp('deleted_at', { useTz: true }).nullable();
    t.index(['user_id', 'deleted_at', 'updated_at']);
  });

  await knex.schema.alterTable('chat_messages', (t) => {
    t.integer('conversation_id')
      .nullable()
      .references('id')
      .inTable('conversations')
      .onDelete('CASCADE');
    t.index(['conversation_id', 'created_at']);
  });
};

exports.down = async (knex) => {
  await knex.schema.alterTable('chat_messages', (t) => {
    t.dropColumn('conversation_id');
  });
  await knex.schema.dropTable('conversations');
};
