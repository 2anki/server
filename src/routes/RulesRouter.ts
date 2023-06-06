import express from 'express';

import RequireAuthentication from '../middleware/RequireAuthentication';
import RulesController from '../controllers/RulesController';
import RulesRepository from '../data_layer/RulesRepository';
import RulesService from './RulesService';
import { getDatabase } from '../data_layer';

const RulesRouter = () => {
  const database = getDatabase();
  const repository = new RulesRepository(database);
  const service = new RulesService(repository);
  const controller = new RulesController(service);
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
