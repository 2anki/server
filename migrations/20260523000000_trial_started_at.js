exports.up = (knex) =>
  knex.schema.alterTable('users', (t) => {
    t.timestamp('trial_started_at', { useTz: true }).nullable().defaultTo(null);
  });

exports.down = (knex) =>
  knex.schema.alterTable('users', (t) => {
    t.dropColumn('trial_started_at');
  });
