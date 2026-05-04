import express from 'express';
import { getIndexFileContents } from '../IndexController/getIndexFileContents';
import { getDatabase } from '../../data_layer';
import { getDefaultEmailService } from '../../services/EmailService/EmailService';
import UsersRepository from '../../data_layer/UsersRepository';
import UsersService from '../../services/UsersService';
import TokenRepository from '../../data_layer/TokenRepository';
import AuthenticationService from '../../services/AuthenticationService';
import { getStripe, updateStoreSubscription } from '../../lib/integrations/stripe';
import { extractTokenFromCookies } from './extractTokenFromCookies';
import SubscriptionService from '../../services/SubscriptionService';
import type { Stripe as StripeTypes } from 'stripe/cjs/stripe.core';
import { Knex } from 'knex';

async function persistStripeSession(database: Knex, sessionId: string): Promise<boolean> {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== 'paid') {
    return false;
  }
  if (session.subscription) {
    const subscriptionId = typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription.id;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const customerId = typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id;
    const customer = await stripe.customers.retrieve(customerId) as StripeTypes.Customer;
    await updateStoreSubscription(database, customer, subscription);
  }
  return true;
}

async function getAuthenticatedUser(cookies: string | undefined) {
  const token = extractTokenFromCookies(cookies);
  if (!token) {
    return null;
  }
  const database = getDatabase();
  const userRepository = new UsersRepository(database);
  const tokenRepository = new TokenRepository(database);
  const authService = new AuthenticationService(tokenRepository, userRepository);
  return authService.getUserFrom(token);
}

export class StripeController {
  async getSuccessfulCheckout(req: express.Request, res: express.Response) {
    const cookies = req.get('cookie');
    const token = extractTokenFromCookies(cookies);

    if (!token) {
      return res.send(getIndexFileContents());
    }

    const database = getDatabase();
    const emailService = getDefaultEmailService();
    const userRepository = new UsersRepository(database);
    const usersService = new UsersService(userRepository, emailService);
    const tokenRepository = new TokenRepository(database);
    const authService = new AuthenticationService(
      tokenRepository,
      userRepository
    );

    const loggedInUser = await authService.getUserFrom(token);
    const sessionId = req.query.session_id as string;

    console.log('sessionId', sessionId);
    if (loggedInUser && sessionId) {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const email = session.customer_details?.email;

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

  async checkSubscriptionStatus(req: express.Request, res: express.Response) {
    try {
      const user = await getAuthenticatedUser(req.get('cookie'));
      if (!user) {
        return res.status(401).json({ authenticated: false, hasActiveSubscription: false });
      }

      const activeSubscriptions = await SubscriptionService.getUserActiveSubscriptions(user.email);
      let hasActiveSubscription = activeSubscriptions.length > 0 || user.patreon;

      if (!hasActiveSubscription) {
        const sessionId = req.query.session_id as string;
        if (sessionId) {
          hasActiveSubscription = await persistStripeSession(getDatabase(), sessionId);
        }
      }

      return res.json({
        authenticated: true,
        hasActiveSubscription,
        user: {
          email: user.email,
          name: user.name,
          patreon: user.patreon
        }
      });
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return res.status(500).json({ authenticated: false, hasActiveSubscription: false, error: 'Internal server error' });
    }
  }

  async cancelUserSubscriptions(userEmail: string): Promise<void> {
    await SubscriptionService.cancelUserSubscriptions(userEmail);
  }
}
