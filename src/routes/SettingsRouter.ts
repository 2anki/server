import express from 'express';

import RequireAuthentication from '../middleware/RequireAuthentication';
import SettingsController from '../controllers/SettingsController';
import SettingsRepository from '../data_layer/SettingsRepository';

const SettingsRouter = () => {
  const router = express.Router();

  const controller = new SettingsController(new SettingsRepository());

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
