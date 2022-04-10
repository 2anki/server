import { Knex } from "knex";

export default function getOwnerFromAccessToken(DB: Knex, token: string) {
  return DB("access_tokens")
    .where({ token, host: "2anki.net" })
    .returning(["owner"])
    .first();
}
