import express from 'express';

import RequireAuthentication from './middleware/RequireAuthentication';
import RequirePatron from './middleware/RequirePatron';
import NotionController from '../private/integrations/notion/NotionController';
import NotionRepository from '../data_layer/NotionRespository';
import { getDatabase } from '../data_layer';
import NotionService from '../private/integrations/notion';

const NotionRouter = () => {
  const router = express.Router();

  const repository = new NotionRepository(getDatabase());
  const controller = new NotionController(new NotionService(repository));

  /**
   * Endpoint for establishing a connection to Notion. We need a token for this.
   * Reference: https://developers.notion.so/
   */
  router.get('/api/notion/connect', RequireAuthentication, (req, res) =>
    controller.connect(req, res)
  );

  router.post('/api/notion/pages', RequireAuthentication, (req, res) =>
    controller.search(req, res)
  );

  router.get('/api/notion/get-notion-link', RequireAuthentication, (req, res) =>
    controller.getNotionLink(req, res)
  );

  router.post('/api/notion/convert/', RequireAuthentication, (req, res) =>
    controller.convert(req, res)
  );
  router.get('/api/notion/page/:id', RequireAuthentication, (req, res) =>
    controller.getPage(req, res)
  );

  router.get('/api/notion/blocks/:id', RequireAuthentication, (req, res) =>
    controller.getBlocks(req, res)
  );

  router.get('/api/notion/block/:id', RequireAuthentication, (req, res) =>
    controller.getBlock(req, res)
  );

  router.post('/api/notion/block/:id', RequireAuthentication, (req, res) =>
    controller.createBlock(req, res)
  );

  router.delete('/api/notion/block/:id', RequirePatron, (req, res) =>
    controller.deleteBlock(req, res)
  );

  router.get('/api/notion/render-block/:id', RequirePatron, (req, res) =>
    controller.renderBlock(req, res)
  );

  router.get('/api/notion/database/:id', RequireAuthentication, (req, res) =>
    controller.getDatabase(req, res)
  );

  router.get(
    '/api/notion/database/query/:id',
    RequireAuthentication,
    (req, res) => controller.queryDatabase(req, res)
  );

  return router;
};

export default NotionRouter;
