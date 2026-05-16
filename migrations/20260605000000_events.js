exports.up = async (knex) => {
  await knex.schema.createTable('events', (t) => {
    t.bigIncrements('id').primary();
    t.string('name', 64).notNullable();
    t.integer('user_id').nullable().references('id').inTable('users').onDelete('SET NULL');
    t.string('anonymous_id', 64).nullable();
    t.jsonb('props').notNullable().defaultTo('{}');
    t.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.index(['name', 'created_at'], 'events_name_created_at_idx');
    t.index(['user_id', 'created_at'], 'events_user_id_created_at_idx');
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable('events');
};
