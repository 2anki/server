import { Request, Response } from 'express';

import DB from '../../lib/storage/db';
import { sendError } from '../../lib/error/sendError';

export default async function (req: Request, res: Response) {
  const access = await DB('access_tokens')
    .where({ token: req.cookies.token })
    .returning(['owner'])
    .first();
  await DB('settings')
    .del()
    .where({
      owner: access.owner,
      object_id: req.body.object_id,
    })
    .then(() => {
      res.status(200).send();
    })
    .catch((err) => {
      sendError(err);
      res.status(400).send();
    });
}
