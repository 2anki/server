import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("users").del();

  // Inserts seed entries
  await knex("users").insert([
    {
      id: 21,
      name: "Alexander Alemayhu",
      password: "ichiban",
      email: "a@alemayhu.com",
    },
  ]);
}
