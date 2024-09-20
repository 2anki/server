import express from 'express';
import { getIndexFileContents } from '../IndexController/getIndexFileContents';
import { getDatabase } from '../../data_layer';
import { useDefaultEmailService } from '../../services/EmailService/EmailService';
import UsersRepository from '../../data_layer/UsersRepository';
import UsersService from '../../services/UsersService';
import TokenRepository from '../../data_layer/TokenRepository';
import AuthenticationService from '../../services/AuthenticationService';
import { getCustomerId, getStripe, updateStoreSubscription } from '../../lib/integrations/stripe';
import { extractTokenFromCookies } from './extractTokenFromCookies';
import Stripe from 'stripe';

export class StripeController {
  async getSuccessfulCheckout(req: express.Request, res: express.Response) {
    const cookies = req.get('cookie');
    const token = extractTokenFromCookies(cookies);

    if (!token) {
      return res.send(getIndexFileContents());
    }

    const database = getDatabase();
    const emailService = useDefaultEmailService();
    const userRepository = new UsersRepository(database);
    const usersService = new UsersService(userRepository, emailService);
    const tokenRepository = new TokenRepository(database);
    const authService = new AuthenticationService(
      tokenRepository,
      userRepository
    );

    const loggedInUser = await authService.getUserFrom(token);
    const sessionId = req.query.session_id as string;

    console.log('loggedInUser', loggedInUser);
    console.log('sessionId', sessionId);
    if (loggedInUser && sessionId) {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const email = session.customer_details?.email;

      console.log('cmp', loggedInUser.email, ' ', email);
      if (loggedInUser.email !== email && email) {
        console.log('updated email for customer');
        await usersService.updateSubScriptionEmailUsingPrimaryEmail(
          email.toLowerCase(),
          loggedInUser.email.toLowerCase()
        );
      }
    }

    res.send(getIndexFileContents());
  }

  async postWebhook(request: express.Request, response: express.Response) {
    {
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
  }
}
