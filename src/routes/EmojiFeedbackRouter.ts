import express from 'express';

import EmojiFeedbackController from '../controllers/EmojiFeedbackController';
import { EmojiFeedbackRepository } from '../data_layer/EmojiFeedbackRepository';
import { getDatabase } from '../data_layer';

const EmojiFeedbackRouter = () => {
  const router = express.Router();
  const database = getDatabase();
  const repo = new EmojiFeedbackRepository(database);
  const controller = new EmojiFeedbackController(repo);

  router.post('/api/emoji-feedback', (req, res) =>
    controller.submit(req, res)
  );

  return router;
};

export default EmojiFeedbackRouter;
