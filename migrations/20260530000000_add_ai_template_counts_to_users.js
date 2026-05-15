exports.up = (knex) =>
  knex.schema.table('users', (t) => {
    t.integer('ai_template_generate_count').notNullable().defaultTo(0);
    t.integer('ai_template_modify_count').notNullable().defaultTo(0);
  });

exports.down = (knex) =>
  knex.schema.table('users', (t) => {
    t.dropColumn('ai_template_generate_count');
    t.dropColumn('ai_template_modify_count');
  });
