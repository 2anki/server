module.exports.up = function (knex) {
	return knex.schema.createTable("slicer_rules", function (table) {
		table.increments("id");
		table.string("object_id", 255).unique().notNullable();
		table.string("flashcard_is", 255).notNullable().default("Toggles");
		table.string("deck_is", 255).notNullable().default("Pages");
		table.string("sub_deck_is", 255).notNullable().default("Pages");
		table.string("tags_is", 255).notNullable().default("Headings");
	});
};

exports.down = function (knex) {
	return knex.schema.dropTable("slicer_rules");
};
