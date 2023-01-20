import { Request, Response } from 'express';
import DB from '../../lib/storage/db';
import { sendError } from '../../lib/error/sendError';

export default async function deleteJob(req: Request, res: Response) {
  console.log('delete job', req.params.id);
  try {
    const id = req.params.id;
    await DB('jobs').delete().where({
      id: id,
      owner: res.locals.owner,
    });
    res.status(200).send();
  } catch (err) {
    res.status(500).send();
    sendError(err);
  }
}
