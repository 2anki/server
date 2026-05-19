exports.up = (knex) =>
  knex.schema.table('users', (t) => {
    t.integer('pdf_prints_this_month').notNullable().defaultTo(0);
    t.timestamp('prints_month_started_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
  });

exports.down = (knex) =>
  knex.schema.table('users', (t) => {
    t.dropColumn('pdf_prints_this_month');
    t.dropColumn('prints_month_started_at');
  });
