exports.up = (knex) =>
  knex.schema.alterTable('users', (t) => {
    t.timestamp('onboarded_at', { useTz: true }).nullable().defaultTo(null);
  });

exports.down = (knex) =>
  knex.schema.alterTable('users', (t) => {
    t.dropColumn('onboarded_at');
  });
