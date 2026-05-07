exports.up = async function (knex) {
  await knex.schema.createTable('ankify_session_tokens', function (table) {
    table.increments('id').primary();
    table
      .integer('ankify_client_id')
      .notNullable()
      .references('id')
      .inTable('ankify_clients')
      .onDelete('CASCADE');
    table.integer('owner').notNullable();
    table.string('token_hash', 64).notNullable().unique();
    table.timestamp('expires_at').notNullable();
    table.timestamp('last_used_at').nullable();
    table.timestamp('revoked_at').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.index('token_hash', 'ankify_session_tokens_lookup');
  });

  await knex.raw(
    'CREATE UNIQUE INDEX ankify_session_tokens_one_active_per_client ' +
      'ON ankify_session_tokens(ankify_client_id) WHERE revoked_at IS NULL'
  );
};

exports.down = async function (knex) {
  await knex.raw(
    'DROP INDEX IF EXISTS ankify_session_tokens_one_active_per_client'
  );
  await knex.schema.dropTable('ankify_session_tokens');
};
