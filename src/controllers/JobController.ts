import express from 'express';

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
    res.send(jobs);
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
