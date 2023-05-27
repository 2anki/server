import express from 'express';

import RequireAuthentication from '../middleware/RequireAuthentication';
import FavoriteController from '../controllers/FavoriteController';
import FavoriteService from '../services/FavoriteService';
import { FavoritesRepository } from '../data_layer/FavoritesRepository';

const FavoriteRouter = () => {
  const router = express.Router();
  const controller = new FavoriteController(
    new FavoriteService(new FavoritesRepository())
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
  router.get('/api/favorite', RequireAuthentication, controller.getFavorites);

  return router;
};

export default FavoriteRouter;
