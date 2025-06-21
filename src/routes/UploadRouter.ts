import express from 'express';
import multer from 'multer';

import RequireAllowedOrigin from './middleware/RequireAllowedOrigin';
import RequireAuthentication from './middleware/RequireAuthentication';
import UploadController from '../controllers/Upload/UploadController';
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
   * It is used to upload files to the server, and there is a whitelist in place to prevent
   * abuse. In the future, this API will be moved to a separate server.
   */
  router.post('/api/upload/file', RequireAllowedOrigin, (req, res) =>
    uploadController.file(req, res)
  );

  router.post(
    '/api/upload/dropbox',
    RequireAllowedOrigin,
    multer({ dest: '/tmp' }).none(),
    (req, res) => uploadController.dropbox(req, res)
  );

  router.post(
    '/api/upload/google_drive',
    RequireAllowedOrigin,
    multer({ dest: '/tmp' }).none(),
    (req, res) => uploadController.googleDrive(req, res)
  );

  router.get('/api/upload/mine', RequireAuthentication, (req, res) =>
    uploadController.getUploads(req, res)
  );
  router.get('/api/upload/jobs', RequireAuthentication, (req, res) =>
    jobController.getJobsByOwner(req, res)
  );
  router.delete('/api/upload/jobs/:id', RequireAuthentication, (req, res) =>
    jobController.deleteJobByOwner(req, res)
  );
  router.delete('/api/upload/mine/:key', RequireAuthentication, (req, res) =>
    uploadController.deleteUpload(req, res)
  );

  return router;
};

export default UploadRouter;
