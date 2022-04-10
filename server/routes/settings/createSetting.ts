import { Request, Response } from "express";

import DB from "../../lib/storage/db";

export default async function createSetting(req: Request, res: Response) {
  console.info(`/settings/create ${req.params.id}`);
  const _settings = req.body.settings;
  const access = await DB("access_tokens")
    .where({ token: req.cookies.token })
    .returning(["owner"])
    .first();

  DB("settings")
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
      console.error(err);
      res.status(400).send();
    });
}
