import express from 'express';

import RequireAllowedOrigin from '../middleware/RequireAllowedOrigin';
import RequireAuthentication from '../middleware/RequireAuthentication';
import UploadController from '../controllers/UploadController';
import JobController from '../controllers/JobController';

const UploadRouter = () => {
  const router = express.Router();

  router.post('/api/upload/file', RequireAllowedOrigin, UploadController.file);

  router.get(
    '/api/upload/mine',
    RequireAuthentication,
    UploadController.getUploads
  );
  router.delete(
    '/api/upload/jobs/:id',
    RequireAuthentication,
    JobController.deleteJob
  );
  router.delete(
    '/api/upload/mine/:key',
    RequireAuthentication,
    UploadController.deleteUpload
  );

  return router;
};

export default UploadRouter;
