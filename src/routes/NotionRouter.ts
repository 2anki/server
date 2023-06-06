import express from 'express';

import RequireAuthentication from '../middleware/RequireAuthentication';
import RequirePatron from '../middleware/RequirePatron';
import NotionController from '../controllers/NotionController';
import NotionRepository from '../data_layer/NotionRespository';
import NotionService from '../services/NotionService';
import { getDatabase } from '../data_layer';

const NotionRouter = () => {
  const router = express.Router();

  const repository = new NotionRepository(getDatabase());
  const controller = new NotionController(new NotionService(repository));

  /**
   * Endpoint for establishing a connection to Notion. We need a token for this.
   * Reference: https://developers.notion.so/
   */
  router.get('/api/notion/connect', RequireAuthentication, controller.connect);

  router.post('/api/notion/pages', RequireAuthentication, controller.search);

  router.get(
    '/api/notion/get-notion-link',
    RequireAuthentication,
    controller.getNotionLink
  );

  router.post(
    '/api/notion/convert/',
    RequireAuthentication,
    controller.convert
  );
  router.get('/api/notion/page/:id', RequireAuthentication, controller.getPage);

  router.get(
    '/api/notion/blocks/:id',
    RequireAuthentication,
    controller.getBlocks
  );

  router.get(
    '/api/notion/block/:id',
    RequireAuthentication,
    controller.getBlock
  );

  router.post(
    '/api/notion/block/:id',
    RequireAuthentication,
    controller.createBlock
  );

  router.delete('/api/notion/block/:id', RequirePatron, controller.deleteBlock);

  router.get(
    '/api/notion/render-block/:id',
    RequirePatron,
    controller.renderBlock
  );

  router.get(
    '/api/notion/database/:id',
    RequireAuthentication,
    controller.getDatabase
  );

  router.get(
    '/api/notion/database/query/:id',
    RequireAuthentication,
    controller.queryDatabase
  );

  return router;
};

export default NotionRouter;
