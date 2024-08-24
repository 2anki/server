import express from 'express';
import multer from 'multer';

import RequireAuthentication from './middleware/RequireAuthentication';
import IndexController from '../controllers/IndexController/IndexController';

const upload = multer({
  limits: { fileSize: 25 * 1024 * 1024 },
  dest: process.env.FEEDBACK_DIR || '~/',
});

const DefaultRouter = () => {
  const controller = new IndexController();
  const router = express.Router();

  router.get('/index.html', (req, res) => controller.getIndex(req, res));
  router.get('/search*', RequireAuthentication, controller.getIndex);
  router.get('*', (req, res) => controller.getIndex(req, res));

  router.post('/api/contact-us', upload.array('attachments'), (req, res) =>
    controller.contactUs(req, res)
  );

  return router;
};

export default DefaultRouter;
