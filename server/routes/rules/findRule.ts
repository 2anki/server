import { Request, Response } from 'express';

import DB from '../../lib/storage/db';

export default async function findRule(req: Request, res: Response) {
  console.info(`/rules/find ${req.params.id}`);
  const { id } = req.params;
  console.log('id', id);
  if (!id) return res.status(400).send();
  await DB('parser_rules')
    .where({ object_id: id })
    .returning('*')
    .first()
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      console.error(err);
      res.status(400).send();
    });
}
