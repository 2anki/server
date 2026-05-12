exports.up = function (knex) {
  return knex.schema.createTable('magic_tokens', function (table) {
    table.increments('id').primary();
    table.string('token', 128).notNullable().unique();
    table.integer('owner').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('purpose', 20).notNullable();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('expires_at', { useTz: true }).notNullable();
    table.timestamp('used_at', { useTz: true }).nullable();
    table.index('token', 'idx_magic_tokens_token');
    table.index('owner', 'idx_magic_tokens_owner');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('magic_tokens');
};
