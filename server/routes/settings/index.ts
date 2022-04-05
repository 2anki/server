import RequireAuthentication from "../../middleware/RequireAuthentication";

import express from "express";
import DB from "../../lib/storage/db";

const router = express.Router();

router.post("/create/:id", RequireAuthentication, async (req, res) => {
  console.info(`/settings/create ${req.params.id}`);
  const _settings = req.body.settings;
  const access = await DB("access_tokens")
    .where({ token: req.cookies.token })
    .returning(["owner"])
    .first();

  await DB("settings")
    .insert({
      /* @ts-ignore */
      owner: access.owner,
      object_id: _settings.object_id,
      payload: _settings.payload,
    })
    .onConflict("object_id")
    .merge()
    .then(() => {
      res.status(200).send();
    })
    .catch((err) => {
      res.status(400).send();
    });
});

router.post("/delete/:id", RequireAuthentication, async (req, res) => {
  console.debug(`/settings/delete ${req.params.id}`);
  const access = await DB("access_tokens")
    .where({ token: req.cookies.token })
    .returning(["owner"])
    .first();
  await DB("settings")
    .del()
    .where({
      /* @ts-ignore */
      owner: access.owner,
      object_id: req.body.object_id,
    })
    .then(() => {
      res.status(200).send();
    })
    .catch((err) => {
      res.status(400).send();
    });
});

router.get("/find/:id", RequireAuthentication, async (req, res) => {
  console.debug("find settings " + req.params.id);
  const id = req.params.id;
  if (!id) return res.status(400).send();
  await DB("settings")
    .where({ object_id: id })
    .returning(["payload"])
    .first()
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      console.error(err);
      res.status(400).send();
    });
});

export default router;
