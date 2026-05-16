exports.up = async (knex) => {
  await knex.schema.createTable('user_passes', (t) => {
    t.increments('id').primary();
    t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.text('kind').notNullable();
    t.timestamp('expires_at', { useTz: true }).notNullable();
    t.text('stripe_payment_intent_id').notNullable().unique();
  });
  await knex.schema.raw(
    'CREATE INDEX idx_user_passes_active ON user_passes (user_id, expires_at)'
  );
};

exports.down = async (knex) => {
  await knex.schema.dropTable('user_passes');
};
