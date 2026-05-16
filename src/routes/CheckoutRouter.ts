import express from 'express';
import RequireAuthentication from './middleware/RequireAuthentication';
import AutoSyncCheckoutController from '../controllers/AutoSyncCheckoutController';
import { AutoSyncCheckoutUseCase } from '../usecases/checkout/AutoSyncCheckoutUseCase';
import { getStripe } from '../lib/integrations/stripe';

const DEFAULT_MAX_SUBSCRIBERS = 50;

const CheckoutRouter = () => {
  const router = express.Router();

  const priceId = process.env.AUTO_SYNC_PRICE_ID ?? '';
  const productId = process.env.AUTO_SYNC_PRODUCT_ID ?? '';
  const maxSubscribers = parseInt(process.env.HOSTED_ANKI_MAX_SUBSCRIBERS ?? '', 10) || DEFAULT_MAX_SUBSCRIBERS;

  router.post(
    '/api/checkout/auto-sync',
    RequireAuthentication,
    express.json(),
    (req, res) => {
      if (priceId === '') {
        return res.status(404).json({ message: 'Auto Sync checkout is not available' });
      }
      const useCase = new AutoSyncCheckoutUseCase(getStripe(), priceId, productId, maxSubscribers);
      const controller = new AutoSyncCheckoutController(useCase);
      return controller.createSession(req, res);
    }
  );

  return router;
};

export default CheckoutRouter;
