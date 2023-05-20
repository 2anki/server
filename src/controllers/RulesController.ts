import { Request, Response } from 'express';

import RulesRepository from '../data_layer/RulesRepository';
import { sendError } from '../lib/error/sendError';

class RulesController {
  constructor(private readonly repository: RulesRepository) {}

  createRule(req: Request, res: Response) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).send();
    }

    this.repository
      .create(id, res.locals.owner, req.body.payload)
      .then((result) => res.status(200).send(result))
      .catch((err) => {
        sendError(err);
        res.status(400).send();
      });
  }

  findRule(req: Request, res: Response) {
    console.info(`/rules/find ${req.params.id}`);
    const { id } = req.params;
    console.log('id', id);

    if (!id) {
      return res.status(400).send();
    }

    this.repository
      .getById(id)
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((err) => {
        sendError(err);
        res.status(400).send();
      });
  }
}

export default RulesController;
