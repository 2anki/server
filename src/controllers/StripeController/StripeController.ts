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
      const email = session.customer_email;

      console.log('cmp', loggedInUser.email, ' ', email);
      if (loggedInUser.email !== email && email) {
        await usersService.updateSubScriptionEmailUsingPrimaryEmail(
          email.toLowerCase(),
          loggedInUser.email.toLowerCase()
        );
      }
    }

    res.send(getIndexFileContents());
  }
}
