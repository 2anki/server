exports.up = (knex) =>
  knex.schema.alterTable('users', (t) => {
    t.jsonb('card_options').nullable().defaultTo(null);
    t.text('theme').nullable().defaultTo(null);
  });

exports.down = (knex) =>
  knex.schema.alterTable('users', (t) => {
    t.dropColumn('card_options');
    t.dropColumn('theme');
  });
