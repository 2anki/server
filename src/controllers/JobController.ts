import express from 'express';

import { sendError } from '../lib/error/sendError';
import JobService from '../services/JobService';
import { getOwner } from '../lib/User/getOwner';

class JobController {
  constructor(private readonly service: JobService) {}

  async getJobsByOwner(_req: express.Request, res: express.Response) {
    const jobs = await this.service.getJobsByOwner(getOwner(res));
    res.send(jobs);
  }

  async deleteJobByOwner(req: express.Request, res: express.Response) {
    try {
      const id = req.params.id;
      await this.service.deleteJobById(id, getOwner(res));

      res.status(200).send();
    } catch (error) {
      res.status(500).send();
      sendError(error);
    }
  }
}

export default JobController;
