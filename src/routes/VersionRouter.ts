import express from 'express';
import VersionController from '../controllers/VersionController';

const VersionRouter = () => {
  const router = express.Router();
  router.get('/api/version', VersionController.getVersionInfo);
  return router;
};

export default VersionRouter;
