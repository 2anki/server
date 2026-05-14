exports.up = (knex) =>
  knex.schema.table('settings', (t) => {
    t.string('title', 255).nullable();
  });

exports.down = (knex) =>
  knex.schema.table('settings', (t) => {
    t.dropColumn('title');
  });
