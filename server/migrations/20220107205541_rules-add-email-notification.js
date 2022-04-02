module.exports.up = (knex) => {
	return knex.schema.table("parser_rules", (table) => {
		table.boolean("email_notification").defaultTo(false);
	});
};


module.exports.down = (knex) => {
	return knex.schema.table("parser_rules", (table) => {
		table.dropColumn("email_notification");
	});
};

