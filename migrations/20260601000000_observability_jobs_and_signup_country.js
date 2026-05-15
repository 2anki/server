exports.up = async (knex) => {
  await knex.schema.table('users', (t) => {
    t.string('signup_country', 2).nullable();
  });
  await knex.schema.table('jobs', (t) => {
    t.integer('card_count').nullable();
  });
  await knex.raw(
    'CREATE INDEX IF NOT EXISTS jobs_status_last_edited_time_idx ON jobs (status, last_edited_time DESC)'
  );
  await knex.raw(
    'CREATE INDEX IF NOT EXISTS users_signup_country_created_at_idx ON users (signup_country, created_at DESC) WHERE signup_country IS NOT NULL'
  );
};

exports.down = async (knex) => {
  await knex.raw('DROP INDEX IF EXISTS users_signup_country_created_at_idx');
  await knex.raw('DROP INDEX IF EXISTS jobs_status_last_edited_time_idx');
  await knex.schema.table('jobs', (t) => {
    t.dropColumn('card_count');
  });
  await knex.schema.table('users', (t) => {
    t.dropColumn('signup_country');
  });
};
