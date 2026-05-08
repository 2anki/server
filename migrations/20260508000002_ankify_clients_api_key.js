exports.up = async function (knex) {
  await knex.schema.alterTable('ankify_clients', (table) => {
    table.string('anki_connect_api_key').nullable();
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable('ankify_clients', (table) => {
    table.dropColumn('anki_connect_api_key');
  });
};
