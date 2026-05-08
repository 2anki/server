exports.up = async function (knex) {
  await knex.schema.createTable('ankify_clients', function (table) {
    table.increments('id').primary();
    table.integer('owner').notNullable();
    table.string('container_id').notNullable();
    table.string('container_name').nullable();
    table.integer('anki_port').notNullable();
    table.integer('vnc_port').notNullable();
    table.integer('novnc_port').notNullable();
    table.string('status').notNullable().defaultTo('active');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('last_active_at').defaultTo(knex.fn.now());
    table.index('owner');
    table.unique('container_id');
  });

  await knex.raw(
    "CREATE UNIQUE INDEX ankify_clients_one_active_per_owner ON ankify_clients(owner) WHERE status = 'active'"
  );
};

exports.down = async function (knex) {
  await knex.raw('DROP INDEX IF EXISTS ankify_clients_one_active_per_owner');
  await knex.schema.dropTable('ankify_clients');
};
