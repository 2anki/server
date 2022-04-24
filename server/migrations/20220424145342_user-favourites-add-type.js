module.exports.up = (knex) => {
	return knex.schema.table("favorites", (table) => {
		table.string("type").notNullable();
	});
};


module.exports.down = (knex) => {
	return knex.schema.table("favorites", (table) => {
		table.dropColumn("type");
	});
};

