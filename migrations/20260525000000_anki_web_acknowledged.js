exports.up = (knex) =>
  knex.schema.alterTable('users', (t) => {
    t.timestamp('anki_web_acknowledged_at', { useTz: true }).nullable().defaultTo(null);
  });

exports.down = (knex) =>
  knex.schema.alterTable('users', (t) => {
    t.dropColumn('anki_web_acknowledged_at');
  });
