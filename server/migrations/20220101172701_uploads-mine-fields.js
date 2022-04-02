module.exports.up = (knex) => {
	return knex.schema.table("uploads", (table) => {
		table.string("external_url");
		table.string("type");
	});
};


module.exports.down = (knex) => {
	return knex.schema.table("uploads", (table) => {
		table.string("external_url");
		table.string("type");
	});
};

