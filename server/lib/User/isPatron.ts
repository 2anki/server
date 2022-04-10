import { Knex } from "knex";

export default function isPatron(DB: Knex, id: string) {
  return DB("users").where({ id }).returning(["patreon"]).first();
}
