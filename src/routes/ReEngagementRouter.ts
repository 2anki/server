import express from 'express';

import { ReEngagementController } from '../controllers/ReEngagementController';
import ReEngagementRepository from '../data_layer/ReEngagementRepository';
import EmailPreferencesRepository from '../data_layer/EmailPreferencesRepository';
import { getDatabase } from '../data_layer';

const ReEngagementRouter = () => {
  const router = express.Router();
  const database = getDatabase();
  const repo = new ReEngagementRepository(database);
  const prefRepo = new EmailPreferencesRepository(database);
  const controller = new ReEngagementController(repo, prefRepo);

  router.get('/feedback/onboarding', (req, res) =>
    controller.validateToken(req, res)
  );

  router.post('/feedback/onboarding', (req, res) =>
    controller.submitFeedback(req, res)
  );

  router.get('/unsubscribe', (req, res) =>
    controller.unsubscribe(req, res)
  );

  return router;
};

export default ReEngagementRouter;
