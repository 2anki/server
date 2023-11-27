import express from 'express';

import SimpleUploadController from '../controllers/SimpleUploadController/SimpleUploadController';
import RequireAllowedOrigin from './middleware/RequireAllowedOrigin';

const UploadRouter = () => {
  const controller = new SimpleUploadController();
  const router = express.Router();

  router.post('/api/simple-upload/file', RequireAllowedOrigin, (req, res) =>
    controller.file(req, res)
  );

  return router;
};

export default UploadRouter;
