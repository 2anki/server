exports.up = (knex) =>
  knex.schema.table('dropbox_uploads', (t) => {
    t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now()).nullable();
  });

exports.down = (knex) =>
  knex.schema.table('dropbox_uploads', (t) => {
    t.dropColumn('created_at');
  });
