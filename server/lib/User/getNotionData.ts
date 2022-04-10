import { Knex } from "knex";

export default async function getNotionData(DB: Knex, owner: string) {
  return DB("notion_tokens").where({ owner }).returning(["token"]).first();
}
