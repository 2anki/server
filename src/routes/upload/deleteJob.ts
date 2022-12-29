import { captureException } from '@sentry/node';
import { Request, Response } from 'express';

import ConversionJob from '../../lib/storage/jobs/ConversionJob';
import DB from '../../lib/storage/db';

export default async function deleteJob(req: Request, res: Response) {
  console.log('delete job', req.params.id);
  try {
    const c = new ConversionJob(DB);
    await c.completed();
    res.status(200).send();
  } catch (err) {
    res.status(500).send();
    captureException(err);
  }
}
