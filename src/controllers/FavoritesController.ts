import { Request, Response } from 'express';

import { getDatabase } from '../data_layer';
import NotionRepository from '../data_layer/NotionRespository';
import sendErrorResponse from '../lib/sendErrorResponse';
import FavoriteService from '../services/FavoriteService';
import NotionService from '../services/NotionService';
import { getReturnStatusCodeFromBoolean } from './helpers/getReturnStatusCodeFromBoolean';

class FavoritesController {
  constructor(private service: FavoriteService) {}

  async createFavorite(req: Request, res: Response) {
    try {
      const { id, type } = req.body;
      const { owner } = res.locals;
      const didCreate = await this.service.create({
        object_id: id,
        owner,
        type,
      });
      res.status(getReturnStatusCodeFromBoolean(didCreate)).send();
    } catch (error) {
      sendErrorResponse(error, res);
    }
  }

  async deleteFavorite(req: Request, res: Response) {
    try {
      const { owner } = res.locals;
      const { id } = req.body;
      const didDelete = await this.service.delete(id, owner);

      res.status(getReturnStatusCodeFromBoolean(didDelete)).send();
    } catch (error) {
      sendErrorResponse(error, res);
    }
  }

  async getFavorites(_req: Request, res: Response) {
    const { owner } = res.locals;

    try {
      const notionRepository = new NotionRepository(getDatabase());
      const notionService = new NotionService(notionRepository);
      const favorites = await this.service.getFavoritesByOwner(
        owner,
        notionService
      );
      res.json(favorites);
    } catch (error) {
      res.json([]);
    }
  }
}

export default FavoritesController;
