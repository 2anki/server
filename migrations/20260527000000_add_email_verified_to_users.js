exports.up = (knex) =>
  knex.schema.table('users', (t) => {
    t.boolean('email_verified').notNullable().defaultTo(false);
  });

exports.down = (knex) =>
  knex.schema.table('users', (t) => {
    t.dropColumn('email_verified');
  });
