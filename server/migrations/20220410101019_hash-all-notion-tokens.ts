import { Knex } from "knex";

import unHashToken from "../lib/misc/unHashToken";
import hashToken from "../lib/misc/hashToken";

export function up(knex: Knex) {
  return knex
    .select()
    .from("notion_tokens")
    .then((users) => {
      return knex.transaction((trx) => {
        return knex.schema
          .table("notion_tokens", (table) =>
            Promise.all(
              users.map((row) => {
                return knex("notion_tokens")
                  .update({ token: hashToken(row.token), encrypted: true })
                  .where({ owner: row.owner, encrypted: false })
                  .transacting(trx);
              })
            )
          )
          .then(trx.commit)
          .catch(trx.rollback);
      });
    });
}

export function down(knex: Knex) {
  return knex
    .select()
    .from("notion_tokens")
    .then((users) => {
      return knex.transaction((trx) => {
        return knex.schema
          .table("notion_tokens", (table) =>
            Promise.all(
              users.map((row) => {
                return knex("notion_tokens")
                  .update({ token: unHashToken(row.token), encrypted: false })
                  .where({ owner: row.owner, encrypted: true })
                  .transacting(trx);
              })
            )
          )
          .then(trx.commit)
          .catch(trx.rollback);
      });
    });
}
