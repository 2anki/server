import express from 'express';

import RequireAuthentication from './middleware/RequireAuthentication';
import CardOptionsController from '../controllers/CardOptionsController/CardOptionsController';
import SettingsRepository from '../data_layer/SettingsRepository';
import { getDatabase } from '../data_layer';
import SettingsService from '../services/SettingsService';

const SettingsRouter = () => {
  const router = express.Router();
  const database = getDatabase();
  const controller = new CardOptionsController(
    new SettingsService(new SettingsRepository(database))
  );

  router.post('/api/settings/create/:id', RequireAuthentication, (req, res) =>
    controller.createSetting(req, res)
  );
  router.post('/api/settings/delete/:id', RequireAuthentication, (req, res) =>
    controller.deleteSetting(req, res)
  );
  router.get('/api/settings/find/:id', RequireAuthentication, (req, res) =>
    controller.findSetting(req, res)
  );
  router.get('/api/settings/default', (_req, res) => {
    const defaultOptions = controller.getDefaultCardOptions('client');
    res.json(defaultOptions);
  });

  router.get('/api/settings/card-options', (_req, res) => {
    const defaultOptions = controller.getDefaultCardOptionDetails();
    res.json(defaultOptions);
  });

  return router;
};

export default SettingsRouter;
