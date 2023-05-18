import express from 'express';

import { getAllMyJobs } from '../lib/storage/jobs/helpers/getAllStartedJobs';
import DB from '../lib/storage/db';
import { sendError } from '../lib/error/sendError';

const getAllJobs = async (_req: express.Request, res: express.Response) => {
  console.time('getting active jobs');
  const jobs = await getAllMyJobs(DB, res.locals.owner);
  console.timeEnd('getting active jobs');
  res.send(jobs);
};

const deleteJob = async (req: express.Request, res: express.Response) => {
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
};
const JobController = {
  deleteJob,
  getAllJobs,
};

export default JobController;
