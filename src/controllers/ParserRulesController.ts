import { Request, Response } from 'express';

import ParserRulesService from '../services/ParserRulesService';
import { getOwner } from '../lib/User/getOwner';

class RulesController {
  constructor(private readonly service: ParserRulesService) {}

  async createRule(req: Request, res: Response) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).send();
    }

    try {
      await this.service.createRule(id, getOwner(res), req.body.payload);
      res.status(201).json({ message: 'Rule created' });
    } catch (error) {
      console.info('Create rule failed');
      console.error(error);
      res.status(400).send();
    }
  }

  async findRule(req: Request, res: Response) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).send();
    }

    try {
      const rule = await this.service.getById(id);
      res.status(200).json(rule);
    } catch (err) {
      console.info('Get rule failed');
      console.error(err);
      res.status(200).json();
    }
  }

  async deleteRule(req: Request, res: Response) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).send();
    }

    await this.service.deleteRule(id, getOwner(res));
    res.status(204).send();
  }
}

export default RulesController;
