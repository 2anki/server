exports.up = async (knex) => {
  await knex.schema.table('users', (t) => {
    t.timestamp('chat_consent_at', { useTz: true }).nullable();
  });
};

exports.down = async (knex) => {
  await knex.schema.table('users', (t) => {
    t.dropColumn('chat_consent_at');
  });
};
