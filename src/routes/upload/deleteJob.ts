import { Request, Response } from 'express';
import ConversionJob from '../../lib/storage/jobs/ConversionJob';
import DB from '../../lib/storage/db';
import { sendError } from '../../lib/error/sendError';

export default async function deleteJob(req: Request, res: Response) {
  console.log('delete job', req.params.id);
  try {
    const id = req.params.id;
    const c = new ConversionJob(DB);
    await c.load(id, res.locals.owner);
    await c.completed();
    res.status(200).send();
  } catch (err) {
    res.status(500).send();
    sendError(err);
  }
}
