import { Request, Response } from 'express';

import { APIResponseError } from '@notionhq/client';
import FavoriteService from '../services/FavoriteService';
import sendErrorResponse from '../lib/sendErrorResponse';
import { getReturnStatusCodeFromBoolean } from './helpers/getReturnStatusCodeFromBoolean';
import NotionService from '../services/NotionService';
import NotionRepository from '../data_layer/NotionRespository';
import { getDatabase } from '../data_layer';

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
      if (error instanceof APIResponseError) {
        purgeMissingFavorites(owner);
      }
      res.json([]);
      sendErrorResponse(error, res);
    }
  }
}

export default FavoritesController;
