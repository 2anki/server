module.exports.up = (knex) => {
	return knex.schema.table("notion_tokens", (table) => {
		table.string("token_type").defaultTo("bearer");
		table.string("bot_id");
		table.string("workspace_name");
		table.string("workspace_icon");
		table.string("workspace_id");
		table.json("notion_owner");
	});
};

module.exports.down = (knex) => {
	return knex.schema.table("notion_tokens", (table) => {
		table.dropColumn("token_type");
		table.dropColumn("bot_id").notNullable();
		table.dropColumn("workspace_name");
		table.dropColumn("workspace_icon");
		table.dropColumn("workspace_id");
		table.dropColumn("notion_owner");
	});
};