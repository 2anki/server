import { Request, Response } from "express";

import DB from "../../lib/storage/db";

export default async function findSetting(req: Request, res: Response) {
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
}
