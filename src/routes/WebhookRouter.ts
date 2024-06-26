import express from 'express';
import Stripe from 'stripe';

import {
  getCustomerId,
  getStripe,
  updateStoreSubscription,
} from '../lib/integrations/stripe';
import { getDatabase } from '../data_layer';
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
      const sig = request.headers['stripe-signature'];
      const stripe = getStripe();
      let event;

      try {
        event = stripe.webhooks.constructEvent(
          request.body,
          // @ts-ignore
          sig,
          process.env.STRIPE_ENDPOINT_SECRET
        );
      } catch (err) {
        // @ts-ignore
        response.status(400).send(`Webhook Error: ${err.message}`);
        console.error(err);
        return;
      }

      // Handle the event
      switch (event.type) {
        case 'customer.subscription.updated':
          const customerSubscriptionUpdated = event.data.object;
          // Then define and call a function to handle the event customer.subscription.updated
          const customer = await stripe.customers.retrieve(
            getCustomerId(customerSubscriptionUpdated.customer)
          );

          await updateStoreSubscription(
            getDatabase(),
            customer as Stripe.Customer,
            customerSubscriptionUpdated
          );
          break;
        case 'customer.subscription.deleted':
          const customerSubscriptionDeleted = event.data.object;
          // Then define and call a function to handle the event customer.subscription.deleted
          const customerDeleted = await stripe.customers.retrieve(
            getCustomerId(customerSubscriptionDeleted.customer)
          );

          await updateStoreSubscription(
            getDatabase(),
            customerDeleted as Stripe.Customer,
            customerSubscriptionDeleted
          );
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      // Return a 200 response to acknowledge receipt of the event
      response.send();
    }
  );

  router.get('/successful-checkout', (req, res) =>
    controller.getSuccessfulCheckout(req, res)
  );
  return router;
};

export default WebhooksRouter;
