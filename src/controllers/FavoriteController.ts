import { Request, Response } from 'express';

import { getNotionAPI } from '../lib/notion/helpers/getNotionAPI';
import { APIResponseError } from '@notionhq/client';
import DB from '../lib/storage/db';
import NotionRepository from '../data_layer/NotionRespository';
import FavoriteService from '../services/FavoriteService';
import sendErrorResponse from '../lib/sendErrorResponse';

class FavoriteController {
  constructor(private service: FavoriteService) {}

  async createFavorite(req: Request, res: Response) {
    try {
      const { id, type } = req.body;
      const { owner } = res.locals;

      if (this.service.isValidInput(id, type)) {
        return res.status(400).send();
      }

      await this.service.create({ object_id: id, owner, type });

      return res.status(200).send();
    } catch (error) {
      sendErrorResponse(error, res);
    }
  }

  async deleteFavorite(req: Request, res: Response) {
    try {
      const { owner } = res.locals;
      const { id } = req.body;

      if (!id) {
        return res.status(400).send();
      }

      await this.service.delete(id, owner);

      return res.status(200).send();
    } catch (error) {
      sendErrorResponse(error, res);
    }
  }

  async getFavorites(req: Request, res: Response) {
    const api = await getNotionAPI(req, res, new NotionRepository(DB));
    const { owner } = res.locals;

    try {
      const favorites = await this.service.getFavoritesByOwner(owner);
      const notionBlocks = await this.service.mapToNotionBlocks(favorites, api);
      res.json(notionBlocks);
    } catch (error) {
      if (error instanceof APIResponseError) {
        console.info('purging favorites for');
        this.service.deleteMissingFavorites(owner);
      }
      res.json([]);
      sendErrorResponse(error, res);
    }
  }
}

export default FavoriteController;
