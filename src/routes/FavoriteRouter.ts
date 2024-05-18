import express from 'express';

import FavoritesController from '../private/features/favorites/FavoritesController';
import { getDatabase } from '../data_layer';
import { FavoritesRepository } from '../data_layer/FavoritesRepository';
import FavoriteService from '../private/features/favorites/FavoriteService';
import RequireAuthentication from './middleware/RequireAuthentication';

const FavoriteRouter = () => {
  const router = express.Router();
  const controller = new FavoritesController(
    new FavoriteService(new FavoritesRepository(getDatabase()))
  );

  router.post('/api/favorite/create', RequireAuthentication, (req, res) =>
    controller.createFavorite(req, res)
  );
  router.post('/api/favorite/remove', RequireAuthentication, (req, res) =>
    controller.deleteFavorite(req, res)
  );
  router.get(
    '/api/favorite',
    RequireAuthentication,
    (request: express.Request, response: express.Response) => {
      controller.getFavorites(request, response);
    }
  );

  return router;
};

export default FavoriteRouter;
