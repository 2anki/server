import express from 'express';

import SimpleUploadController from '../controllers/SimpleUploadController';
import RequireAllowedOrigin from './middleware/RequireAllowedOrigin';

const UploadRouter = () => {
  const router = express.Router();
  const uploadController = new SimpleUploadController();

  router.post('/api/simple-upload/file', RequireAllowedOrigin, (req, res) =>
    uploadController.file(req, res)
  );

  return router;
};

export default UploadRouter;
