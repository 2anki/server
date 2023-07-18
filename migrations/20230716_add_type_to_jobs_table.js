exports.up = function (knex) {
        return knex.schema.table('jobs', function (table) {
                table.string('type').nullable();
        });
};

exports.down = function (knex) {
        return knex.schema.table('jobs', function (table) {
                table.dropColumn('type');
        });
};
