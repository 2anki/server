
exports.up = function (knex) {
	return knex.schema.createTable("jobs", function (table) {
		table.increments("id");
		table.string("owner", 255).notNullable();
		table.string("object_id", 255).unique().notNullable();
		table.string("status").defaultTo("started").notNullable();
		table.timestamp("created_at").defaultTo(knex.fn.now());
		table.timestamp("last_edited_time").defaultTo(knex.fn.now());
	});
};

exports.down = function (knex) {
	return knex.schema.dropTable("jobs");
};
