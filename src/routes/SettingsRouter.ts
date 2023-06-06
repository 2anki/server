import express from 'express';

import RequireAuthentication from '../middleware/RequireAuthentication';
import SettingsController from '../controllers/SettingsController';
import SettingsRepository from '../data_layer/SettingsRepository';
import { getDatabase } from '../data_layer';
import SettingsService from '../services/SettingsService';

const SettingsRouter = () => {
  const router = express.Router();
  const database = getDatabase();
  const controller = new SettingsController(
    new SettingsService(new SettingsRepository(database))
  );

  router.post(
    '/api/settings/create/:id',
    RequireAuthentication,
    controller.createSetting
  );
  router.post(
    '/api/settings/delete/:id',
    RequireAuthentication,
    controller.deleteSetting
  );
  router.get(
    '/api/settings/find/:id',
    RequireAuthentication,
    controller.findSetting
  );

  return router;
};

export default SettingsRouter;
