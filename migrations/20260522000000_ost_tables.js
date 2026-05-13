exports.up = (knex) =>
  knex.schema
    .createTable('ost_versions', (table) => {
      table.uuid('id').primary();
      table
        .timestamp('generated_at', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());
      table.integer('snapshot_count').notNullable().defaultTo(0);
      table.text('raw_response');
    })
    .createTable('opportunity_tree_nodes', (table) => {
      table.uuid('id').primary();
      table
        .uuid('ost_version_id')
        .notNullable()
        .references('id')
        .inTable('ost_versions')
        .onDelete('CASCADE');
      table
        .uuid('parent_id')
        .nullable()
        .references('id')
        .inTable('opportunity_tree_nodes');
      table.text('body').notNullable();
      table.text('type').notNullable(); // outcome | opportunity | sub_opportunity | solution
      table.integer('depth').notNullable().defaultTo(0);
      table.integer('sort_order').notNullable().defaultTo(0);
    });

exports.down = (knex) =>
  knex.schema
    .dropTableIfExists('opportunity_tree_nodes')
    .dropTableIfExists('ost_versions');
