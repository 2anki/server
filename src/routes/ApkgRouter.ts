import express from 'express';

import RequireAuthentication from './middleware/RequireAuthentication';
import ApkgController from '../controllers/ApkgController';
import ApkgPreviewService from '../services/ApkgPreviewService/ApkgPreviewService';
import DownloadService from '../services/DownloadService';
import DownloadRepository from '../data_layer/DownloadRepository';
import { getDatabase } from '../data_layer';

const ApkgRouter = () => {
  const database = getDatabase();
  const downloadService = new DownloadService(new DownloadRepository(database));
  const previewService = new ApkgPreviewService();
  const controller = new ApkgController(downloadService, previewService);
  const router = express.Router();

  router.get('/api/apkg/:key/meta', RequireAuthentication, (req, res) =>
    controller.getMeta(req, res)
  );

  router.get('/api/apkg/:key/cards', RequireAuthentication, (req, res) =>
    controller.getCards(req, res)
  );

  return router;
};

export default ApkgRouter;
