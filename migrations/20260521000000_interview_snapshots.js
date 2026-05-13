exports.up = (knex) =>
  knex.schema
    .createTable('interview_snapshots', (table) => {
      table.uuid('id').primary();
      table.text('participant_name').notNullable();
      table.text('memorable_quote').notNullable().defaultTo('');
      table.text('photo_data');
      table.date('signup_date');
      table.text('plan_tier').notNullable().defaultTo('');
      table.text('usage_pattern').notNullable().defaultTo('');
      table.text('source').notNullable().defaultTo('');
      table.text('experience_map_data');
      table.date('interview_date').notNullable();
      table.integer('session_length_minutes');
      table
        .timestamp('created_at', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());
      table
        .timestamp('updated_at', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());
    })
    .createTable('interview_opportunities', (table) => {
      table.uuid('id').primary();
      table
        .uuid('snapshot_id')
        .notNullable()
        .references('id')
        .inTable('interview_snapshots')
        .onDelete('CASCADE');
      table.text('body').notNullable();
      table.text('tag').notNullable(); // 'opportunity' | 'insight'
      table
        .timestamp('created_at', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());
    });

exports.down = (knex) =>
  knex.schema
    .dropTableIfExists('interview_opportunities')
    .dropTableIfExists('interview_snapshots');
