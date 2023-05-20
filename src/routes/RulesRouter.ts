import express from 'express';

import RequireAuthentication from '../middleware/RequireAuthentication';
import RulesController from '../controllers/RulesController';
import RulesRepository from '../data_layer/RulesRepository';
import DB from '../lib/storage/db';

const RulesRouter = () => {
  const repository = new RulesRepository(DB);
  const controller = new RulesController(repository);
  const router = express.Router();

  router.get('/api/rules/find/:id', RequireAuthentication, controller.findRule);
  router.post(
    '/api/rules/create/:id',
    RequireAuthentication,
    controller.createRule
  );

  return router;
};

export default RulesRouter;
