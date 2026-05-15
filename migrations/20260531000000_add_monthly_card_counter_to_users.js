exports.up = (knex) =>
  knex.schema.table('users', (t) => {
    t.integer('cards_used_this_month').notNullable().defaultTo(0);
    t.timestamp('cards_month_started_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
  });

exports.down = (knex) =>
  knex.schema.table('users', (t) => {
    t.dropColumn('cards_used_this_month');
    t.dropColumn('cards_month_started_at');
  });
