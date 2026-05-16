exports.up = function (knex) {
  return knex.schema
    .table('notion_tokens', (t) => t.dropColumn('encrypted'))
    .table('access_tokens', (t) => t.dropColumn('host'))
    .table('uploads', (t) => t.dropColumn('external_url'));
};

exports.down = function (knex) {
  return knex.schema
    .table('notion_tokens', (t) => t.boolean('encrypted').defaultTo(false))
    .table('access_tokens', (t) => t.string('host').defaultTo('2anki.net'))
    .table('uploads', (t) => t.string('external_url').nullable());
};
