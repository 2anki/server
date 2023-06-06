import { Request, Response } from 'express';

import { sendError } from '../lib/error/sendError';
import RulesService from '../services/RulesService';
import { getOwner } from '../lib/User/getOwner';

class RulesController {
  constructor(private readonly service: RulesService) {}

  async createRule(req: Request, res: Response) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).send();
    }

    try {
      const result = await this.service.createRule(
        id,
        getOwner(res),
        req.body.payload
      );
      res.status(200).send(result);
    } catch (error) {
      sendError(error);
      res.status(400).send();
    }
  }

  findRule(req: Request, res: Response) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).send();
    }

    try {
      const rule = this.service.getById(id);
      res.status(200).json(rule);
    } catch (err) {
      sendError(err);
      res.status(400).send();
    }
  }
}

export default RulesController;
