import express from 'express';
import RequireAuthentication from './middleware/RequireAuthentication';
import IndexController from '../controllers/IndexController/IndexController';

const DefaultRouter = () => {
  const controller = new IndexController();
  const router = express.Router();

  router.get('/index.html', (req, res) => controller.getIndex(req, res));
  router.get('/search*', RequireAuthentication, controller.getIndex);
  router.get('*', (req, res) => controller.getIndex(req, res));

  return router;
};

export default DefaultRouter;
