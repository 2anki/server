exports.up = (knex) =>
  knex.schema.alterTable('conversations', (t) => {
    t.text('draft_content').nullable().defaultTo(null);
  });

exports.down = (knex) =>
  knex.schema.alterTable('conversations', (t) => {
    t.dropColumn('draft_content');
  });
