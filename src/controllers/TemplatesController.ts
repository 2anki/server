import { Request, Response } from 'express';

import TemplatesRepository from '../data_layer/TemplatesRepository';
import TokenRepository from '../data_layer/TokenRepository';

class TemplatesController {
  constructor(private repository: TemplatesRepository) {
    this.repository = repository;
  }

  async createTemplate(req: Request, res: Response) {
    console.info(`/templates/create`);
    const { templates } = req.body;
    const access = await new TokenRepository().getAccessToken(req);
    return this.repository
      .create({ owner: access.owner.toString(), payload: templates })
      .then(() => {
        res.status(200).send();
      })
      .catch((err) => {
        console.error(err);
        res.status(400).send();
      });
  }

  async deleteTemplate(req: Request, res: Response) {
    const access = await new TokenRepository().getAccessToken(req);
    return this.repository
      .delete(access.owner)
      .then(() => {
        res.status(200).send();
      })
      .catch((err) => {
        console.error(err);
        res.status(400).send();
      });
  }
}

export default TemplatesController;
