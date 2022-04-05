import express from "express";

import RequireAuthentication from "../../../middleware/RequireAuthentication";
import DB from "../../../lib/storage/db";
import StorageHandler from "../../../lib/storage/StorageHandler";

const router = express.Router();

let storage = new StorageHandler();
router.get("/u/:key", RequireAuthentication, async (req, res) => {
  const key = req.params.key;
  console.debug("download " + key);
  if (!key) {
    return res.status(400).send();
  }
  let owner = res.locals.owner;
  const query = { key, owner };
  try {
    const match = await DB("uploads").where(query).returning(["key"]).first();
    if (match) {
      const file = await storage.getFileContents(match.key);
      res.send(file);
    } else {
      res.status(404).send();
    }
  } catch (error) {
    // @ts-ignore
    if (error && error.code === "NoSuchKey") {
      await DB("uploads").del().where(query);
      return res.redirect("/uploads");
    } else {
      console.info("unknown error");
      console.error(error);
    }
  }
});

export default router;
