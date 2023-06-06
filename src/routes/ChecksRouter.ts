import express from 'express';
import ChecksController from '../controllers/ChecksController';

const ChecksRouter = () => {
  const router = express.Router();
  router.get('/api/checks', (req, res) =>
    ChecksController.getStatusCheck(req, res)
  );
  return router;
};

export default ChecksRouter;
