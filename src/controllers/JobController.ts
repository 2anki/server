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
      res.status(500).send();
      console.info('Delete job failed');
      console.error(error);
    }
  }
}

export default JobController;
