import { Request, Response } from 'express';

import DB from '../../lib/storage/db';
import { sendError } from '../../lib/error/sendError';

export default async function createSetting(req: Request, res: Response) {
  console.info(`/settings/create ${req.params.id}`);
  const { settings } = req.body;
  const access = await DB('access_tokens')
    .where({ token: req.cookies.token })
    .returning(['owner'])
    .first();

  DB('settings')
    .insert({
      owner: access.owner,
      object_id: settings.object_id,
      payload: settings.payload,
    })
    .onConflict('object_id')
    .merge()
    .then(() => {
      res.status(200).send();
    })
    .catch((err) => {
      sendError(err);
      res.status(400).send();
    });
}
