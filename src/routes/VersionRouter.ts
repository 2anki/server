import express from 'express';
import VersionController from '../controllers/VersionController';
import VersionService from '../services/VersionService';

const VersionRouter = () => {
  const controller = new VersionController(new VersionService());
  const router = express.Router();

  router.get('/api/version', (req, res) => controller.getVersionInfo(req, res));

  return router;
};

export default VersionRouter;
