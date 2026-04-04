import { Request, Response } from 'express';

import { getOwner } from '../lib/User/getOwner';
import { TemplateService } from '../services/TemplatesService/TemplateService';

class TemplatesController {
  constructor(private readonly service: TemplateService) {}

  async createTemplate(req: Request, res: Response) {
    const { templates } = req.body;
    const owner = getOwner(res);

    try {
      await this.service.create(owner, templates);
      res.status(200).send();
    } catch (error) {
      res.status(400).send();
    }
  }

  async deleteTemplate(req: Request, res: Response) {
    const owner = getOwner(res);

    try {
      await this.service.delete(owner);
      res.status(200).send();
    } catch (error) {
      res.status(400).send();
    }
  }
}

export default TemplatesController;
