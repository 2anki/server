exports.up = async (knex) => {
  await knex.schema.table('google_drive_uploads', (t) => {
    t.timestamp('last_converted_at', { useTz: true })
      .defaultTo(knex.fn.now())
      .nullable();
    t.index('owner');
  });
};

exports.down = async (knex) => {
  await knex.schema.table('google_drive_uploads', (t) => {
    t.dropIndex('owner');
    t.dropColumn('last_converted_at');
  });
};
