import { Request, Response } from "express";

import ConversionJob from "../../lib/jobs/ConversionJob";
import DB from "../../lib/storage/db";

export default async function getActiveJobs(_req: Request, res: Response) {
  console.debug("getting jobs");
  try {
    ConversionJob.ResumeStaleJobs(DB, res.locals.owner);
    const c = new ConversionJob(DB);
    const jobs = await c.AllStartedJobs(res.locals.owner);
    res.send(jobs);
  } catch (error) {
    console.error(error);
  }
}
