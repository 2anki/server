import express from 'express';
import multer from 'multer';

import IndexController from '../controllers/IndexController/IndexController';
import { ensureIsLoggedIn } from './middleware/ensureIsLoggedIn';

const upload = multer({
  limits: { fileSize: 25 * 1024 * 1024 },
  dest: process.env.FEEDBACK_DIR || '~/',
});

const DefaultRouter = () => {
  const controller = new IndexController();
  const router = express.Router();

  router.get('/index.html', (req, res) => controller.getIndex(req, res));
  router.get('/search', async (req, res) => {
    const isLoggedIn = await ensureIsLoggedIn(req, res);
    if (!isLoggedIn) {
      return;
    }
    controller.getIndex(req, res);
  });
  router.get(/^\/(?!api).*/, (req, res) => controller.getIndex(req, res));
  router.post('/api/contact-us', upload.array('attachments'), (req, res) =>
    controller.contactUs(req, res)
  );

  return router;
};

export default DefaultRouter;
