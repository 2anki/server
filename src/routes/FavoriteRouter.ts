import express from 'express';

import RequireAuthentication from '../middleware/RequireAuthentication';
import FavoriteController from '../controllers/FavoriteController';
import FavoriteService from '../services/FavoriteService';
import { FavoritesRepository } from '../data_layer/FavoritesRepository';
import NotionRepository from '../data_layer/NotionRespository';
import { getDatabase } from '../data_layer';
import NotionService from '../services/NotionService';

const FavoriteRouter = () => {
  const router = express.Router();
  const controller = new FavoriteController(
    new FavoriteService(new FavoritesRepository(getDatabase()))
  );

  router.post(
    '/api/favorite/create',
    RequireAuthentication,
    controller.createFavorite
  );
  router.post(
    '/api/favorite/remove',
    RequireAuthentication,
    controller.deleteFavorite
  );
  router.get(
    '/api/favorite',
    RequireAuthentication,
    (request: express.Request, response: express.Response) => {
      controller.getFavorites(
        request,
        response,
        new NotionService(new NotionRepository(getDatabase()))
      );
    }
  );

  return router;
};

export default FavoriteRouter;
