import express from 'express';

import RequireAuthentication from './middleware/RequireAuthentication';
import RulesController from '../controllers/ParserRulesController';
import ParserRulesRepository from '../data_layer/ParserRulesRepository';
import ParserRulesService from '../services/ParserRulesService';
import { getDatabase } from '../data_layer';

const ParserRulesRouter = () => {
  const database = getDatabase();
  const repository = new ParserRulesRepository(database);
  const service = new ParserRulesService(repository);
  const controller = new RulesController(service);
  const router = express.Router();

  router.get('/api/rules/find/:id', RequireAuthentication, (req, res) =>
    controller.findRule(req, res)
  );
  router.post('/api/rules/create/:id', RequireAuthentication, (req, res) =>
    controller.createRule(req, res)
  );

  return router;
};

export default ParserRulesRouter;
