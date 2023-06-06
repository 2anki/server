import express from 'express';

import RequireAllowedOrigin from './middleware/RequireAllowedOrigin';
import RequireAuthentication from './middleware/RequireAuthentication';
import UploadController from '../controllers/UploadController';
import JobController from '../controllers/JobController';
import JobService from '../services/JobService';
import JobRepository from '../data_layer/JobRepository';
import UploadService from '../services/UploadService';
import { getDatabase } from '../data_layer';
import UploadRepository from '../data_layer/UploadRespository';
import NotionRepository from '../data_layer/NotionRespository';
import NotionService from '../services/NotionService';

const UploadRouter = () => {
  const router = express.Router();
  const database = getDatabase();
  const jobController = new JobController(
    new JobService(new JobRepository(database))
  );
  const uploadController = new UploadController(
    new UploadService(new UploadRepository(database)),
    new NotionService(new NotionRepository(database))
  );

  /**
   * This API is open to the public and therefore does not require authentication.
   * It is used to upload files to the server and there is a whitelist in place to prevent
   * abuse. In the future, this API will be moved to a separate server.
   */
  router.post('/api/upload/file', RequireAllowedOrigin, uploadController.file);

  router.get(
    '/api/upload/mine',
    RequireAuthentication,
    uploadController.getUploads
  );
  router.delete(
    '/api/upload/jobs/:id',
    RequireAuthentication,
    jobController.deleteJobByOwner
  );
  router.delete(
    '/api/upload/mine/:key',
    RequireAuthentication,
    uploadController.deleteUpload
  );

  router.get('/api/uploads*', RequireAuthentication, router);

  return router;
};

export default UploadRouter;
