import { Request, Response } from 'express';

import remove from '../../lib/favorite/remove';
import ensureResponse from '../notion/helpers/ensureResponse';

export default function deleteFavorite(req: Request, res: Response) {
  ensureResponse(async () => {
    const { id } = req.body;
    if (!id) {
      return res.status(400).send();
    }
    const { owner } = res.locals;
    await remove(id, owner);
    res.status(200).send();
  }, res);
}
