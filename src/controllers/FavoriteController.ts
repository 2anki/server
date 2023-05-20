import { Request, Response } from 'express';

import ensureResponse from '../lib/ensureResponse';
import { getNotionAPI } from '../lib/notion/helpers/getNotionAPI';
import { APIResponseError } from '@notionhq/client';
import DB from '../lib/storage/db';
import Favorites from '../schemas/public/Favorites';
import { FavoritesRepository } from '../data_layer/FavoritesRepository';

class FavoriteController {
  repository: FavoritesRepository;

  constructor(repository: FavoritesRepository) {
    this.repository = repository;
  }

  createFavorite(req: Request, res: Response) {
    ensureResponse(async () => {
      const { id, type } = req.body;
      if (!id || !type) {
        return res.status(400).send();
      }
      const { owner } = res.locals;
      await this.repository.create({ object_id: id, owner, type });
      return res.status(200).send();
    }, res);
  }

  deleteFavorite(req: Request, res: Response) {
    ensureResponse(async () => {
      const { id } = req.body;
      if (!id) {
        return res.status(400).send();
      }
      const { owner } = res.locals;
      await this.repository.remove(id, owner);
      res.status(200).send();
    }, res);
  }

  async getFavorites(req: Request, res: Response) {
    const { owner } = res.locals;
    const api = await getNotionAPI(req, res);
    const favorites = await this.repository.getAll(owner);

    try {
      const notionBlocks = await Promise.all(
        favorites.map((f: Favorites) =>
          f.type === 'page'
            ? api.getPage(f.object_id)
            : api.getDatabase(f.object_id)
        )
      );
      res.json(notionBlocks);
    } catch (err) {
      if (err instanceof APIResponseError) {
        console.info('purging favorites for');
        await DB('favorites').delete().where({
          owner,
        });
      }
      res.json([]);
    }
  }
}

export default FavoriteController;
