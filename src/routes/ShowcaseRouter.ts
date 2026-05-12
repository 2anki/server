import express from 'express';

import ShowcaseController from '../controllers/ShowcaseController';
import { ShowcaseRepository } from '../data_layer/ShowcaseRepository';
import { getDatabase } from '../data_layer';

const ShowcaseRouter = () => {
  const router = express.Router();
  const database = getDatabase();
  const repo = new ShowcaseRepository(database);
  const controller = new ShowcaseController(repo);

  router.get('/api/showcase', (req, res) => controller.getShowcase(req, res));

  return router;
};

export default ShowcaseRouter;
