import { Request, Response } from 'express';

import DB from '../../lib/storage/db';
import { sendError } from '../../lib/error/sendError';

export default async function findSetting(req: Request, res: Response) {
  console.debug(`find settings ${req.params.id}`);
  const { id } = req.params;

  if (!id) {
    return res.status(400).send();
  }

  const storedSettings = await DB('settings')
    .where({ object_id: id })
    .returning(['payload'])
    .first()
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      sendError(err);
      res.status(400).send();
    });
  return res.json({ payload: storedSettings });
}
