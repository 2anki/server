import { Request, Response } from 'express';

import DB from '../../lib/storage/db';

export default async function findSetting(req: Request, res: Response) {
  console.debug(`find settings ${req.params.id}`);
  const { id } = req.params;

  if (!id) {
    return res.status(400).send();
  }

  const storedSettings = await DB('settings')
    .where({ object_id: id })
    .returning(['payload'])
    .first();
  return res.json({ payload: storedSettings });
}
