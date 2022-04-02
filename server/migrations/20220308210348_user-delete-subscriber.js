module.exports.up = (knex) => {
  return knex.schema.table("users", (table) => {
    table.dropColumn("subscriber");
  });
};

module.exports.down = (knex) => {
  return knex.schema.table("users", (table) => {
    table.boolean("subscriber").defaultTo(false);
  });
};
