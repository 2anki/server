import { Knex } from "knex";

import hashPassword from "../lib/User/hashPassword";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("users").del();

  // Inserts seed entries
  await knex("users").insert([
    {
      id: 21,
      name: "Alexander Alemayhu",
      password: hashPassword("ichiban"),
      email: "alexander@alemayhu.com",
    },
  ]);
}
