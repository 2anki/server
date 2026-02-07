import express from 'express';
import { getIndexFileContents } from '../IndexController/getIndexFileContents';
import { getDatabase } from '../../data_layer';
import { useDefaultEmailService } from '../../services/EmailService/EmailService';
import UsersRepository from '../../data_layer/UsersRepository';
import UsersService from '../../services/UsersService';
import TokenRepository from '../../data_layer/TokenRepository';
import AuthenticationService from '../../services/AuthenticationService';
import { getStripe } from '../../lib/integrations/stripe';
import { extractTokenFromCookies } from './extractTokenFromCookies';
import SubscriptionService from '../../services/SubscriptionService';

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
      const cookies = req.get('cookie');
      const token = extractTokenFromCookies(cookies);

      if (!token) {
        return res.status(401).json({ authenticated: false, hasActiveSubscription: false });
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

      const user = await authService.getUserFrom(token);
      if (!user) {
        return res.status(401).json({ authenticated: false, hasActiveSubscription: false });
      }

      // Check if user has active subscription using SubscriptionService
      const activeSubscriptions = await SubscriptionService.getUserActiveSubscriptions(user.email);
      const hasActiveSubscription = activeSubscriptions.length > 0;

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
    return SubscriptionService.cancelUserSubscriptions(userEmail);
  }
}
