import { Knex } from "knex";

export default async function getQuota(DB: Knex, owner: string) {
  const allUserUploads = await DB("uploads")
    .where({ owner })
    .returning(["object_id", "status", "size_mb"]);
  let size = 0;
  for (let u of allUserUploads) {
    size += u.size_mb;
  }
  return size;
}
