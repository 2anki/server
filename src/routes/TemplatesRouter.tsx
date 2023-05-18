import express from 'express';

import RequireAuthentication from '../middleware/RequireAuthentication';
import TemplatesController from '../controllers/TemplatesController';
import TemplatesRepository from '../data_layer/TemplatesRepository';

const TemplatesRouter = () => {
  const router = express.Router();
  const controller = new TemplatesController(new TemplatesRepository());

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
