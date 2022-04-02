module.exports.up = (knex) => {
	return knex.schema.table("uploads", (table) => {
		table.float("size_mb");
	});
};


module.exports.down = (knex) => {
	return knex.schema.table("uploads", (table) => {
		table.float("size_mb");
	});
};

