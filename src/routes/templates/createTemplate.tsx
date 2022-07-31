import { Request, Response } from 'express';

import DB from '../../lib/storage/db';

export default async function createTemplate(req: Request, res: Response) {
  console.info(`/templates/create`);
  const { templates } = req.body;
  const access = await DB('access_tokens')
    .where({ token: req.cookies.token })
    .returning(['owner'])
    .first();

  DB('templates')
    .insert({
      owner: access.owner,
      payload: JSON.stringify(templates),
    })
    .onConflict('owner')
    .merge()
    .then(() => {
      res.status(200).send();
    })
    .catch((err) => {
      console.error(err);
      res.status(400).send();
    });
}
