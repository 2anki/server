import express from 'express';

import { StripeController } from '../controllers/StripeController/StripeController';

const WebhooksRouter = () => {
  const router = express.Router();
  const controller = new StripeController();

  router.post(
    '/webhook',
    // @ts-ignore
    express.raw({ type: 'application/json' }),
    async (
      request: express.Request,
      response: express.Response
    ): Promise<void> => {
      await controller.postWebhook(request, response);
    }
  );

  router.get('/successful-checkout', (req, res) =>
    controller.getSuccessfulCheckout(req, res)
  );
  return router;
};

export default WebhooksRouter;
