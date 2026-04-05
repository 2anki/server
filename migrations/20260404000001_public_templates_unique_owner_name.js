exports.up = async function (knex) {
  await knex.raw(`
    DELETE FROM public_templates
    WHERE id NOT IN (
      SELECT MIN(id)
      FROM public_templates
      GROUP BY owner, name
    )
  `);

  const hasConstraint = await knex.raw(`
    SELECT 1 FROM pg_constraint
    WHERE conname = 'public_templates_owner_name_unique'
  `);
  if (hasConstraint.rows.length === 0) {
    return knex.schema.table('public_templates', function (table) {
      table.unique(['owner', 'name']);
    });
  }
};

exports.down = function (knex) {
  return knex.schema.table('public_templates', function (table) {
    table.dropUnique(['owner', 'name']);
  });
};
