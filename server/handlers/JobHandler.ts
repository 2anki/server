import path from "path";
import os from "os";

import findRemoveSync from "find-remove";
import { Knex } from "knex";

import { TIME_21_MINUTES_AS_SECONDS } from "../lib/constants";
import StorageHandler from "../storage/StorageHandler";

const __deleteOldFiles = () => {
  const locations = ["workspaces", "uploads"];
  for (const loc of locations) {
    console.log(`finding & removing ${loc} files older than 21 minutes`);
    const result = findRemoveSync(path.join(os.tmpdir(), loc), {
      files: "*.*",
      age: { seconds: TIME_21_MINUTES_AS_SECONDS },
    });
    console.log("result", result);
  }
};

let MS_21 = TIME_21_MINUTES_AS_SECONDS * 1000;
async function __deleteOldUploads(db: Knex) {
  let s = new StorageHandler();
  let files = await s.getContents();
  let now = new Date();

  for (const file of files) {
    /* @ts-ignore */
    if (now - new Date(file.LastModified) > MS_21) {
      const upload = await db("uploads")
        .where("key", file.Key)
        .returning("owner");
      /* @ts-ignore */
      if (upload.owner) {
        console.log("file has an owner, skipping");
        continue;
      }
      await s.delete(file);
      console.log(
        "Delete",
        "****",
        "which was last modified on",
        file.LastModified
      );
    }
  }
}

export const ScheduleCleanup = (db: Knex) => {
  setInterval(async () => {
    console.info("running cleanup");
    __deleteOldFiles();
    await __deleteOldUploads(db);
  }, MS_21);
};
