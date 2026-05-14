import express from 'express';
import type { Stripe as StripeTypes } from 'stripe/cjs/stripe.core';

import {
  getCustomerId,
  getStripe,
  updateStoreSubscription,
} from '../lib/integrations/stripe';
import { getDatabase } from '../data_layer';
import { StripeController } from '../controllers/StripeController/StripeController';
import UsersRepository from '../data_layer/UsersRepository';

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
            customer as StripeTypes.Customer,
            customerSubscriptionUpdated
          );

          if (
            customerSubscriptionUpdated.cancel_at_period_end === true &&
            event.data.previous_attributes?.cancel_at_period_end === false &&
            'email' in customer
          ) {
            console.info(
              `Subscription cancellation scheduled for user ${customer.email}, ` +
                `access remains until ${new Date((customerSubscriptionUpdated.cancel_at ?? 0) * 1000).toISOString()}`
            );
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

            if ('email' in customerDeleted && customerDeleted.email) {
              const usersRepo = new UsersRepository(getDatabase());
              const user = await usersRepo.getByEmail(customerDeleted.email);
              if (!user) {
                break;
              }
            }

            await updateStoreSubscription(
              getDatabase(),
              customerDeleted as StripeTypes.Customer,
              customerSubscriptionDeleted
            );

          }
          break;
        case 'checkout.session.completed':
          const session: StripeTypes.Checkout.Session = event.data.object;
          const amount = session.amount_total ?? 0;

          const LIFE_TIME_PRICE = 9600;
          if (amount >= LIFE_TIME_PRICE) {
            try {
              const lifeTimeCustomer = await stripe.customers.retrieve(
                // @ts-ignore
                getCustomerId(session.customer)
              );
              const lifeTimeEmail =
                'email' in lifeTimeCustomer ? lifeTimeCustomer.email : null;

              if (!lifeTimeEmail) {
                console.error(
                  `[webhook] checkout.session.completed: lifetime customer ${lifeTimeCustomer.id} has no email; quota not unlocked`
                );
              } else {
                const users = new UsersRepository(getDatabase());
                const rowsAffected = await users.updatePatreonByEmail(
                  lifeTimeEmail,
                  true
                );
                if (rowsAffected === 0) {
                  console.error(
                    `[webhook] checkout.session.completed: no user row matched email=${lifeTimeEmail} for lifetime purchase; quota NOT unlocked. Check for email casing or whitespace mismatch.`
                  );
                } else {
                  console.info(
                    `[webhook] checkout.session.completed: unlocked lifetime access for email=${lifeTimeEmail} (${rowsAffected} row(s) updated)`
                  );
                }
              }
            } catch (error) {
              console.error(
                '[webhook] checkout.session.completed: failed to unlock lifetime access',
                error
              );
            }
          }

          try {
            const { sendPurchaseEvent } = await import('../services/GA4Service');
            await sendPurchaseEvent({
              transactionId: session.id,
              valueCents: session.amount_total ?? 0,
              currency: session.currency ?? 'usd',
              email: session.customer_details?.email ?? '',
              clientId: (session.metadata as Record<string, string> | null)?.ga_client_id,
            });
          } catch (ga4Error) {
            console.error('[ga4] failed to send purchase event', ga4Error);
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

  /**
   * @swagger
   * /api/stripe/subscription-status:
   *   get:
   *     summary: Check user subscription status
   *     description: Check if the authenticated user has an active subscription
   *     tags: [Payments]
   *     responses:
   *       200:
   *         description: Subscription status information
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 authenticated:
   *                   type: boolean
   *                 hasActiveSubscription:
   *                   type: boolean
   *                 user:
   *                   type: object
   *                   properties:
   *                     email:
   *                       type: string
   *                     name:
   *                       type: string
   *                     patreon:
   *                       type: boolean
   *       401:
   *         description: Not authenticated
   *       500:
   *         description: Server error
   */
  router.get('/api/stripe/subscription-status', (req, res) =>
    controller.checkSubscriptionStatus(req, res)
  );

  return router;
};

export default WebhooksRouter;
