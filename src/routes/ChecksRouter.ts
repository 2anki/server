import express from 'express';
import ChecksController from '../controllers/ChecksController';

const ChecksRouter = () => {
  const router = express.Router();
  const controller = new ChecksController();

  router.get('/api/checks', (req, res) => controller.getStatusCheck(req, res));
  return router;
};

export default ChecksRouter;
