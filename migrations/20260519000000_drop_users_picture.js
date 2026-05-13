exports.up = (knex) =>
  knex.schema.alterTable('users', (table) => {
    table.dropColumn('picture');
  });

exports.down = (knex) =>
  knex.schema.alterTable('users', (table) => {
    table.string('picture').nullable();
  });
