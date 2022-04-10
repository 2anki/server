import { Knex } from "knex";

export default function getEmailFromOwner(DB: Knex, id: string) {
  return DB("users").where({ id }).returning(["email"]).first();
}
