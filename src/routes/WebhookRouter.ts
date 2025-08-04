import express from 'express';
import Stripe from 'stripe';

import {
  getCustomerId,
  getStripe,
  updateStoreSubscription,
} from '../lib/integrations/stripe';
import { getDatabase } from '../data_layer';
import { StripeController } from '../controllers/StripeController/StripeController';
import UsersRepository from '../data_layer/UsersRepository';
import { useDefaultEmailService } from '../services/EmailService/EmailService';

const WebhooksRouter = () => {
  const router = express.Router();
  const controller = new StripeController();

  /**
   * @swagger
   * /webhook:
   *   post:
   *     summary: Stripe webhook handler
   *     description: Handle Stripe webhook events for payment processing and subscription management
   *     tags: [Webhooks]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             description: Stripe webhook event payload
   *     responses:
   *       200:
   *         description: Webhook processed successfully
   *       400:
   *         description: Invalid webhook signature or payload
   *         content:
   *           text/plain:
   *             schema:
   *               type: string
   *               example: "Webhook Error: Invalid signature"
   *     security: []
   *     x-webhook-events:
   *       - customer.subscription.updated
   *       - customer.subscription.deleted
   *       - checkout.session.completed
   */
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
          const customerId = getCustomerId(
            customerSubscriptionUpdated.customer as string
          );
          if (!customerId) {
            console.error('No customer ID found');
            return;
          }
          const customer = await stripe.customers.retrieve(customerId);

          await updateStoreSubscription(
            getDatabase(),
            customer as Stripe.Customer,
            customerSubscriptionUpdated
          );

          if (
            customerSubscriptionUpdated.cancel_at_period_end === true &&
            event.data.previous_attributes?.cancel_at_period_end === false
          ) {
            const cancelDate = new Date(
              customerSubscriptionUpdated.current_period_end * 1000
            );
            const emailService = useDefaultEmailService();
            if ('email' in customer) {
              // Log the scheduled cancellation for debugging purposes
              console.info(
                `Subscription cancellation scheduled for user ${customer.email}, ` +
                  `access remains until ${cancelDate.toISOString()}`
              );

              await emailService.sendSubscriptionScheduledCancellationEmail(
                customer.email!,
                customer.name || 'there',
                cancelDate
              );
            }
          }
          break;
        case 'customer.subscription.deleted':
          const customerSubscriptionDeleted = event.data.object;
          if (typeof customerSubscriptionDeleted.customer === 'string') {
            const deletedCustomerId = getCustomerId(
              customerSubscriptionDeleted.customer
            );
            if (!deletedCustomerId) {
              console.error('No customer ID found');
              return;
            }
            const customerDeleted =
              await stripe.customers.retrieve(deletedCustomerId);

            await updateStoreSubscription(
              getDatabase(),
              customerDeleted as Stripe.Customer,
              customerSubscriptionDeleted
            );

            if ('email' in customerDeleted) {
              const emailService = useDefaultEmailService();
              await emailService.sendSubscriptionCancelledEmail(
                customerDeleted.email!,
                customerDeleted.name || 'there',
                customerSubscriptionDeleted.id
              );
            }
          }
          break;
        case 'checkout.session.completed':
          const session: Stripe.Checkout.Session = event.data.object;
          const amount = session.amount_total ?? 0;

          const LIFE_TIME_PRICE = 9600;
          if (amount >= LIFE_TIME_PRICE) {
            const lifeTimeCustomer = await stripe.customers.retrieve(
              // @ts-ignore
              getCustomerId(session.customer)
            );

            const users = new UsersRepository(getDatabase());
            // @ts-ignore
            await users.updatePatreonByEmail(lifeTimeCustomer.email, true);
          }
          console.log('checkout.session.completed');
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      // Return a 200 response to acknowledge receipt of the event
      response.send();
    }
  );

  /**
   * @swagger
   * /successful-checkout:
   *   get:
   *     summary: Successful checkout page
   *     description: Display the successful checkout confirmation page after payment
   *     tags: [Payments]
   *     responses:
   *       200:
   *         description: Checkout success page rendered
   *         content:
   *           text/html:
   *             schema:
   *               type: string
   *               description: HTML success page
   */
  router.get('/successful-checkout', (req, res) =>
    controller.getSuccessfulCheckout(req, res)
  );
  return router;
};

export default WebhooksRouter;
