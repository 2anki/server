exports.up = (knex) =>
  knex.schema.createTable('io_drafts', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.text('deck_name').notNullable().defaultTo('My image deck');
    t.text('mode').notNullable().defaultTo('hide_all');
    t.jsonb('images').notNullable().defaultTo('[]');
    t.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.unique(['user_id']);
  });

exports.down = (knex) => knex.schema.dropTableIfExists('io_drafts');
