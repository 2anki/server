import express from 'express';

import RequireAuthentication from '../middleware/RequireAuthentication';
import DownloadController from '../controllers/DownloadController';

const DownloadRouter = () => {
  const router = express.Router();
  router.get(
    '/api/download/u/:key',
    RequireAuthentication,
    DownloadController.getFile
  );
  return router;
};

export default DownloadRouter;
