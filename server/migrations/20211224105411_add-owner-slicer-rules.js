module.exports.up = (knex) => {
	return knex.schema.table("slicer_rules", (table) => {
		table.integer("owner").defaultTo(1).notNullable();
	});
};


module.exports.down = (knex) => {
	return knex.schema.table("slicer_rules", (table) => {
		table.dropColumn("owner");
	});
};

