import express from 'express';
import ChecksController from '../controllers/ChecksController';

const ChecksRouter = () => {
  const router = express.Router();
  router.get('/api/checks', ChecksController.getStatusCheck);
  return router;
};

export default ChecksRouter;
