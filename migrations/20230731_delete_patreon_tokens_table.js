exports.up = function (knex) {
        return knex.schema.dropTable('patreon_tokens');
};

exports.down = function (knex) {
        return knex.schema.createTable('patreon_tokens', function (table) {
                table.increments('id').primary();
                table.string('owner', 255).notNullable();
                table.string('token').notNullable();
                table.json('data').notNullable();
                table.timestamp('created_at').defaultTo(knex.fn.now());
                table.timestamps(true, true);
        });
};
