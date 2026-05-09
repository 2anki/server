exports.up = async function (knex) {
  await knex.raw(
    'DROP INDEX IF EXISTS ankify_session_tokens_one_active_per_client'
  );
};

exports.down = async function (knex) {
  await knex.raw(
    'CREATE UNIQUE INDEX ankify_session_tokens_one_active_per_client ' +
      'ON ankify_session_tokens(ankify_client_id) WHERE revoked_at IS NULL'
  );
};
