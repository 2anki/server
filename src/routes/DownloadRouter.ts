import express from 'express';

import RequireAuthentication from '../middleware/RequireAuthentication';
import DownloadController from '../controllers/DownloadController';
import DownloadService from '../services/DownloadService';
import DownloadRepository from '../data_layer/DownloadRepository';
import DB from '../lib/storage/db';
import StorageHandler from '../lib/storage/StorageHandler';

const DownloadRouter = () => {
  const repository = new DownloadRepository(DB);
  const storage = new StorageHandler();
  const controller = new DownloadController(
    new DownloadService(repository, storage)
  );
  const router = express.Router();

  router.get('/api/download/u/:key', RequireAuthentication, controller.getFile);

  return router;
};

export default DownloadRouter;
