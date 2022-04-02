module.exports.up = async function (knex) {
	return knex.schema.createTable("notion_blocks", function (table) {
		table.increments("id");
		table.string("owner", 255).notNullable();
		table.string("object_id", 255).unique().notNullable();
		table.json("payload").notNullable();
		table.timestamp("created_at").defaultTo(knex.fn.now());
		table.timestamp("last_edited_time").defaultTo(knex.fn.now());
	});
};

module.exports.down = async function (knex) {
	return knex.schema.dropTable("notion_blocks");
};