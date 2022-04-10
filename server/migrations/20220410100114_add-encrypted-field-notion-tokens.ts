import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.table("notion_tokens", (table) => {
    table.boolean("encrypted").defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.table("notion_tokens", (table) => {
    table.dropColumn("encrypted");
  });
}
