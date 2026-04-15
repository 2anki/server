import express from 'express';
import fs from 'node:fs';
import path from 'node:path';

import JobService from '../services/JobService';
import { getOwner } from '../lib/User/getOwner';

class JobController {
  constructor(private readonly service: JobService) {}

  async getJobsByOwner(_req: express.Request, res: express.Response) {
    const owner = getOwner(res);
    if (!owner) {
      res.redirect('/login');
      return;
    }
    const jobs = await this.service.getJobsByOwner(owner);
    res.send(jobs.map((j) => ({ ...j, restartable: true })));
  }

  async downloadJobResult(req: express.Request, res: express.Response) {
    const owner = getOwner(res);
    const jobId = req.params.jobId;
    const job = await this.service.findJobByObjectId(jobId, owner);
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }
    if (job.status !== 'done') {
      res.status(409).json({ error: 'Job not done yet', status: job.status });
      return;
    }
    const workspaceBase = process.env.WORKSPACE_BASE!;
    const dir = path.join(workspaceBase, job.object_id);
    let files: string[];
    try {
      files = fs.readdirSync(dir);
    } catch {
      res.status(404).json({ error: 'Workspace not found' });
      return;
    }
    const apkgFile = files.find((f) => f.endsWith('.apkg'));
    if (!apkgFile) {
      res.status(404).json({ error: 'APKG file not found' });
      return;
    }
    const filePath = path.join(dir, apkgFile);
    res.set('Content-Type', 'application/apkg');
    res.download(filePath, apkgFile);
  }

  async deleteJobByOwner(req: express.Request, res: express.Response) {
    try {
      const id = req.params.id;
      await this.service.deleteJobById(id, getOwner(res));

      res.status(200).send();
    } catch (error) {
      // Check if it's a job in progress error
      if (
        error instanceof Error &&
        error.message === 'Cannot delete job while it is in progress'
      ) {
        res
          .status(409)
          .json({ error: 'Cannot delete job while it is in progress' });
        return;
      }

      res.status(500).send();
      console.info('Delete job failed');
      console.error(error);
    }
  }
}

export default JobController;
