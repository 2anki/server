import { captureException } from '@sentry/node';
import { Request, Response } from 'express';

import DB from '../../lib/storage/db';
import { getAllStartedJobs } from '../../lib/storage/jobs/helpers/getAllStartedJobs.js';

export default async function getActiveJobs(_req: Request, res: Response) {
  console.debug('getting jobs');
  try {
    const jobs = await getAllStartedJobs(DB, res.locals.owner);
    res.send(jobs);
  } catch (error) {
    captureException(error);
  }
}
