import { Request, Response } from 'express';

import DB from '../../lib/storage/db';
import { getAllMyJobs } from '../../lib/storage/jobs/helpers/getAllStartedJobs.js';

export default async function getAllJobs(_req: Request, res: Response) {
  console.debug('getting active jobs');
  const jobs = await getAllMyJobs(DB, res.locals.owner);
  res.send(jobs);
}
