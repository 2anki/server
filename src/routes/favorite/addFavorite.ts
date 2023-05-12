import { Request, Response } from 'express';

import create from '../../lib/favorite/create';
import ensureResponse from '../notion/helpers/ensureResponse';

export default function addFavorite(req: Request, res: Response) {
  ensureResponse(async () => {
    const { id, type } = req.body;
    if (!id || !type) {
      return res.status(400).send();
    }
    const { owner } = res.locals;
    await create(id, owner, type);
    return res.status(200).send();
  }, res);
}
