import express from 'express';

import RequireAuthentication from './middleware/RequireAuthentication';
import DownloadController from '../controllers/DownloadController';
import DownloadService from '../services/DownloadService';
import DownloadRepository from '../data_layer/DownloadRepository';
import StorageHandler from '../lib/storage/StorageHandler';
import { getDatabase } from '../data_layer';

const DownloadRouter = () => {
  const database = getDatabase();
  const repository = new DownloadRepository(database);
  const storage = new StorageHandler();
  const controller = new DownloadController(
    new DownloadService(repository, storage)
  );
  const router = express.Router();

  router.get('/api/download/u/:key', RequireAuthentication, controller.getFile);

  return router;
};

export default DownloadRouter;
