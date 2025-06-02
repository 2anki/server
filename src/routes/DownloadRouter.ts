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
  const controller = new DownloadController(new DownloadService(repository));
  const router = express.Router();

  router.get('/api/download/u/:key', RequireAuthentication, (req, res) => {
    const storage = new StorageHandler();
    controller.getFile(req, res, storage);
  });

  router.get('/download/:id', (req, res) => {
    controller.getDownloadPage(req, res);
  });

  router.get('/download/:id/bulk', (req, res) => {
    controller.getBulkDownload(req, res);
  });

  router.get('/download/:id/:filename', (req, res) => {
    controller.getLocalFile(req, res);
  });

  return router;
};

export default DownloadRouter;
