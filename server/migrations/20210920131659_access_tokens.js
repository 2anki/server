module.exports.up = async function (knex) {
  return knex.schema.createTable("access_tokens", (table) => {
    table.integer("owner").unique().notNullable();
    table.text("token").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
};

module.exports.down = async function (knex) {
  return knex.schema.dropTable("access_tokens");
};
