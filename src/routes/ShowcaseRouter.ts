import express from 'express';

import ShowcaseController from '../controllers/ShowcaseController';
import { ShowcaseRepository } from '../data_layer/ShowcaseRepository';
import { getDatabase } from '../data_layer';

const ShowcaseRouter = () => {
  const router = express.Router();
  const database = getDatabase();
  const repo = new ShowcaseRepository(database);
  const controller = new ShowcaseController(repo);

  /**
   * @swagger
   * /api/showcase:
   *   get:
   *     summary: Homepage showcase data
   *     description: Returns cached Notion blocks and Anki cards for the homepage "See it in action" section. Public endpoint, no auth required.
   *     tags: [Showcase]
   *     responses:
   *       200:
   *         description: Showcase data
   *       404:
   *         description: No showcase data populated yet
   */
  router.get('/api/showcase', (req, res) => controller.getShowcase(req, res));

  return router;
};

export default ShowcaseRouter;
