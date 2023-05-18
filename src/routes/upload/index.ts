import express from 'express';

import RequireAllowedOrigin from '../../middleware/RequireAllowedOrigin';
import RequireAuthentication from '../../middleware/RequireAuthentication';
import UploadController from '../../controllers/UploadController';

const useRouter = () => {
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
    UploadController.deleteJob
  );
  router.delete(
    '/api/upload/mine/:key',
    RequireAuthentication,
    UploadController.deleteUpload
  );

  return router;
};

export default useRouter;
