module.exports.up = function (knex) {
	return knex.schema.renameTable("slicer_rules", "parser_rules");
};

exports.down = function (knex) {
	return knex.schema.renameTable("parser_rules", "slicer_rule");
};
