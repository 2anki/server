import express from 'express';

import RequireAuthentication from './middleware/RequireAuthentication';
import TemplatesController from '../controllers/TemplatesController';
import TemplatesRepository from '../data_layer/TemplatesRepository';
import { getDatabase } from '../data_layer';
import TemplateService from '../services/TemplatesService';

const TemplatesRouter = () => {
  const router = express.Router();

  const database = getDatabase();
  const controller = new TemplatesController(
    new TemplateService(new TemplatesRepository(database))
  );

  router.post(
    '/api/templates/create',
    RequireAuthentication,
    controller.createTemplate
  );
  router.post(
    '/api/templates/delete',
    RequireAuthentication,
    controller.deleteTemplate
  );

  return router;
};

export default TemplatesRouter;
