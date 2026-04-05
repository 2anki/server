exports.up = async function (knex) {
  const hasColumn = await knex.schema.hasColumn(
    'public_templates',
    'base_type'
  );
  if (!hasColumn) {
    await knex.schema.alterTable('public_templates', (table) => {
      table.string('base_type').defaultTo('basic');
    });
  }
};

exports.down = async function (knex) {
  await knex.schema.alterTable('public_templates', (table) => {
    table.dropColumn('base_type');
  });
};
