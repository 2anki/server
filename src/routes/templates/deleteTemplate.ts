import { Request, Response } from 'express';

import DB from '../../lib/storage/db';

export default async function (req: Request, res: Response) {
  const access = await DB('access_tokens')
    .where({ token: req.cookies.token })
    .returning(['owner'])
    .first();
  await DB('templates')
    .del()
    .where({
      owner: access.owner,
    })
    .then(() => {
      res.status(200).send();
    })
    .catch((err) => {
      console.error(err);
      res.status(400).send();
    });
}
