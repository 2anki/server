import crypto from 'node:crypto';
import express from 'express';

import AuthenticationService, {
  UserWithOwner,
} from '../services/AuthenticationService';
import UsersService from '../services/UsersService';
import { getRedirect } from './helpers/getRedirect';
import { parseSignupOrigin } from './helpers/parseSignupOrigin';

import { getIndexFileContents } from './IndexController/getIndexFileContents';
import { getRandomUUID } from '../shared/helpers/getRandomUUID';
import SubscriptionService from '../services/SubscriptionService';
import { OPS_OWNER_EMAIL } from '../routes/middleware/RequireOpsAccess';
import { MagicLinkRateLimitError } from '../services/UsersService';
import StartTrialUseCase from '../usecases/users/StartTrialUseCase';
import UsersRepository from '../data_layer/UsersRepository';
import type { UsersId } from '../data_layer/public/Users';

class UsersController {
  constructor(
    private readonly userService: UsersService,
    private readonly authService: AuthenticationService,
    private readonly db: ReturnType<typeof import('../data_layer').getDatabase>
  ) {}

  async newPassword(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    const resetToken = req.body.reset_token;
    const { password } = req.body;

    if (this.authService.isNewPasswordValid(resetToken, password)) {
      return res.status(400).send({ message: 'invalid' });
    }

    try {
      await this.userService.updatePassword(
        this.authService.getHashPassword(password),
        resetToken
      );
      res.status(200).send({ message: 'ok' });
    } catch (error) {
      console.info('Update password failed');
      console.error(error);
      next(new Error('Failed to create new password.'));
    }
  }

  async forgotPassword(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    const { email } = req.body;

    if (!email) {
      console.debug('no email provided');
      return res.status(400).json({ message: 'Email is required' });
    }

    try {
      await this.userService.sendResetEmail(email, this.authService);
      return res.status(200).json({ message: 'ok' });
    } catch (error) {
      console.info('Send reset email failed');
      console.error(error);
      next(error);
    }
  }

  async logOut(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    const { token } = req.cookies;

    if (!token) {
      res.status(400).json({ error: 'Token cookie missing' });
      return;
    }

    try {
      await this.authService.logOut(token);
      res.clearCookie('token');
      res.redirect('/');
    } catch (error) {
      next(error);
    }
  }

  async login(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    console.debug('Login attempt');
    const { email, password } = req.body;
    if (!this.authService.isValidLogin(email, password)) {
      return res.status(400).json({
        message: 'Invalid user data. Required  email and password!',
      });
    }

    try {
      const user = await this.userService.getUserFrom(email);
      if (!user) {
        return res.status(401).json({ message: 'Wrong email or password.' });
      }

      const isMatch = this.authService.comparePassword(password, user.password);
      if (!isMatch) {
        if (typeof user.password === 'string' && !user.password.startsWith('$2b$')) {
          return res.status(401).json({ message: 'Wrong email or password.', hint: 'google' });
        }
        return res.status(401).json({ message: 'Wrong email or password.' });
      }

      const token = await this.authService.newJWTToken(user);
      if (token) {
        await this.authService.persistToken(token, user.id.toString());
        await this.userService.updateLastLoginAt(user.id.toString());
        res.cookie('token', token);
        res.status(200).json({ token, redirect: getRedirect(req) });
      }
    } catch (error) {
      console.info('Login failed');
      console.error(error);
      next(
        new Error('Failed to login, please try again or register your account.')
      );
    }
  }

  async register(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    if (
      !req.body ||
      !this.isValidUser(req.body.password, req.body.email)
    ) {
      res.status(400).json({
        message: 'Invalid user data. Required email and password!',
      });
      return;
    }

    const doesUserExist = await this.userService.getUserFrom(req.body.email);
    if (doesUserExist) {
      console.debug('User already exists');
      return res.status(400).json({
        message:
          'An account with this email already exists. Try logging in instead.',
      });
    }

    const password = this.authService.getHashPassword(req.body.password);
    const { name, email } = req.body;
    const signupOrigin = parseSignupOrigin(req.body.source);
    try {
      await this.userService.register(
        name ?? '',
        password,
        email,
        signupOrigin
      );
      const newUser = await this.userService.getUserFrom(email);
      if (newUser) {
        const token = await this.authService.newJWTToken(newUser.id);
        if (token) {
          await this.authService.persistToken(token, newUser.id.toString());
          await this.userService.updateLastLoginAt(newUser.id.toString());
          res.cookie('token', token);
          return res.status(200).json({ token, verificationPending: true });
        }
      }
      res.status(200).json({ message: 'ok' });
    } catch (error) {
      console.info('Register failed');
      console.error(error);
      return next(error);
    }
  }

  async resetPassword(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    try {
      const token = req.params.id;
      const isValid = await this.authService.isValidToken(token);
      if (isValid) {
        return res.send(getIndexFileContents());
      }
      return res.redirect('/login');
    } catch (err) {
      console.info('Reset password failed');
      console.error(err);
      next(err);
    }
  }

  async getLocals(req: express.Request, res: express.Response) {
    const { locals } = res;
    const user: UserWithOwner | null = await this.authService.getUserFrom(
      req.cookies.token
    );
    let linkedEmail: string | null = null;
    if (user?.owner) {
      linkedEmail = await this.userService.getSubscriptionLinkedEmail(
        user?.owner.toString()
      );
    }

    const featureFlags = {
      kiUI: false,
      ops: user?.email?.toLowerCase() === OPS_OWNER_EMAIL,
    };

    // featureFlags.kiUI = user?.patreon || res.locals.subscriber;

    const response = {
      user: {
        id: user?.id,
        name: user?.name,
        patreon: user?.patreon,
        email: user?.email,
        ankify_welcome_seen: user?.ankify_welcome_seen ?? false,
        trial_started_at: user?.trial_started_at ?? null,
      },
      locals,
      linked_email: linkedEmail,
      features: featureFlags,
      hostedAnkiRequested: user?.hosted_anki_requested_at != null,
    };

    return res.json(response);
  }

  async markAnkifyWelcomeSeen(_req: express.Request, res: express.Response) {
    const { owner } = res.locals;
    if (owner == null) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    await this.userService.markAnkifyWelcomeSeen(owner);
    return res.json({ ok: true });
  }

  async startTrial(_req: express.Request, res: express.Response) {
    const { owner } = res.locals;
    if (owner == null) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    const repository = new UsersRepository(this.db);
    const useCase = new StartTrialUseCase(repository);
    const result = await useCase.execute(owner as UsersId);
    if (result.ok) {
      return res.json({ ok: true, trialExpiresAt: result.trialExpiresAt.toISOString() });
    }
    return res.json({ ok: false, reason: result.reason });
  }

  async linkEmail(req: express.Request, res: express.Response) {
    console.info('linkEmail');
    const { email } = req.body;
    const { owner } = res.locals;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    if (!owner) {
      return res.status(400).json({});
    }

    try {
      const emailExists =
        await this.userService.checkSubscriptionEmailExists(email);
      if (!emailExists) {
        console.warn('Linking attempted with non-existent email');
        return res.status(400).json({ message: 'Failed to link email.' });
      }

      await this.userService.updateSubscriptionLinkedEmail(owner, email);
      return res.status(200).json({});
    } catch (error) {
      console.info('Link email failed');
      console.error(error);
      return res.status(500).json({ message: 'Failed to link email' });
    }
  }

  async requestHostedAnkiAccess(req: express.Request, res: express.Response) {
    const { owner } = res.locals;
    if (owner == null) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    try {
      const result = await this.userService.requestHostedAnkiAccess(owner);
      if (!result.ok) {
        return res.status(500).json({ message: 'Could not send request' });
      }
      return res
        .status(200)
        .json({ ok: true, alreadyRequested: result.alreadyRequested ?? false });
    } catch (error) {
      console.error('Hosted Anki access request failed', error);
      return res.status(500).json({ message: 'Could not send request' });
    }
  }

  async deleteAccount(req: express.Request, res: express.Response) {
    const { owner } = res.locals;
    if (!owner) {
      return res.status(400).json({});
    }

    try {
      const user = await this.userService.getUserById(owner);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      try {
        await SubscriptionService.cancelUserSubscriptions(user.email, 'immediate', true);
      } catch (cancelError) {
        console.error(
          'Subscription cancellation failed during account deletion:',
          cancelError
        );
      }

      await this.userService.deleteUser(owner);
      res.status(200).json({});
    } catch (error) {
      console.info('Delete account failed');
      console.error(error);
      return res.status(500).json({ message: 'Failed to delete account' });
    }
  }

  async cancelSubscription(req: express.Request, res: express.Response) {
    const { owner } = res.locals;
    if (!owner) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const requestedMode = req.body?.mode === 'immediate' ? 'immediate' : 'period_end';
    const reason: string | undefined = req.body?.reason;
    const comment: string | undefined = req.body?.comment;

    try {
      const user = await this.userService.getUserById(owner);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (reason) {
        await this.db('cancellation_feedback').insert({
          owner,
          reason: reason.slice(0, 100),
          comment: comment ? comment.slice(0, 1000) : null,
        });
      }

      const processedCount = await SubscriptionService.cancelUserSubscriptions(
        user.email,
        requestedMode
      );

      if (processedCount === 0) {
        return res.status(404).json({
          message:
            'No active subscription found for your account. If you subscribed with a different email, link it under Subscription Management first or email support@2anki.net.',
        });
      }

      const message =
        requestedMode === 'immediate'
          ? 'Your subscription has been cancelled. A confirmation email is on its way.'
          : 'Your subscription is scheduled to cancel at the end of the current billing period. A confirmation email is on its way.';

      res.status(200).json({ message });
    } catch (error) {
      console.info('Cancel subscription failed');
      console.error(error);
      return res.status(500).json({ message: 'Failed to cancel subscription' });
    }
  }

  async getSubscriptionStatus(req: express.Request, res: express.Response) {
    const { owner } = res.locals;
    if (!owner) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    try {
      const user = await this.userService.getUserById(owner);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const subs = await SubscriptionService.findRecentStripeSubscriptions(
        user.email
      );

      const subscriptions = subs.map((sub) => {
        const firstItem = sub.items?.data?.[0];
        const price = firstItem?.price;
        return {
          id: sub.id,
          status: sub.status,
          cancel_at_period_end: sub.cancel_at_period_end === true,
          cancel_at: sub.cancel_at ?? null,
          canceled_at: sub.canceled_at ?? null,
          current_period_end: firstItem?.current_period_end ?? null,
          plan: price
            ? {
                amount: price.unit_amount ?? null,
                currency: price.currency ?? null,
                interval: price.recurring?.interval ?? null,
              }
            : null,
        };
      });

      res.status(200).json({ subscriptions });
    } catch (error) {
      console.info('Get subscription status failed');
      console.error(error);
      return res
        .status(500)
        .json({ message: 'Failed to load subscription status' });
    }
  }

  async checkUser(req: express.Request, res: express.Response) {
    const user = await this.authService.getUserFrom(req.cookies.token);
    if (!user) {
      res.send(getIndexFileContents());
    } else {
      res.redirect(getRedirect(req));
    }
  }

  patreon(req: express.Request, res: express.Response) {
    return res.redirect('https://www.patreon.com/alemayhu');
  }

  public isValidUser(password: string, email: string) {
    if (!password || !email) {
      return false;
    }
    return true;
  }

  async loginWithGoogle(req: express.Request, res: express.Response) {
    console.debug('Login with google');
    const { code } = req.query;
    if (!code) {
      return res.redirect('/login');
    }

    const loginRequest = await this.authService.loginWithGoogle(code as string);

    if (loginRequest) {
      /**
       * now create a new user if the user does not exist
       */
      const { email, name } = loginRequest;
      let user = await this.userService.getUserFrom(email);
      if (!user) {
        const hashedPassword = this.authService.getHashPassword(getRandomUUID());
        await this.userService.register(name, hashedPassword, email, null, true);
        user = await this.userService.getUserFrom(email);
      }

      if (!user) {
        console.info('Failed to create user');
        return res
          .status(400)
          .send('Unknown error. Please try again or register a new account.');
      }

      await this.userService.markEmailVerified(user.id.toString());

      const token = await this.authService.newJWTToken(user);
      if (!token) {
        console.info('Failed to create token');
        return res
          .status(400)
          .send('Unknown error. Please try again or register a new account.');
      }
      await this.authService.persistToken(token, user.id.toString());
      await this.userService.updateLastLoginAt(user.id.toString());
      res.cookie('token', token);
      res.status(200).redirect(getRedirect(req));
    } else {
      res.redirect('/login');
    }
  }

  async requestMagicLink(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    const { email, purpose: rawPurpose } = req.body;
    const purpose = rawPurpose ?? 'login';

    if (email == null || typeof email !== 'string' || email.trim().length === 0) {
      return res.status(400).json({ message: 'Email is required' });
    }
    if (purpose !== 'login' && purpose !== 'password_reset') {
      return res.status(400).json({ message: 'Invalid purpose' });
    }

    try {
      await this.userService.requestMagicLink(email.trim(), purpose);
    } catch (error) {
      if (error instanceof MagicLinkRateLimitError) {
        return res.status(200).json({ message: 'ok' });
      }
      return next(error);
    }
    return res.status(200).json({ message: 'ok' });
  }

  async verifyEmail(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    const { token } = req.params;
    if (token == null || token.length === 0) {
      return res.redirect('/login?error=verification-expired');
    }

    try {
      const result = await this.userService.verifyMagicToken(token);
      if (result?.purpose !== 'verify_email') {
        return res.redirect('/login?error=verification-expired');
      }
      await this.userService.markEmailVerified(result.userId.toString());
      return res.redirect('/uploads');
    } catch (error) {
      console.error('Email verification failed:', error);
      next(error);
    }
  }

  async verifyMagicLink(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    const { token } = req.params;
    if (token == null || token.length === 0) {
      return res.status(400).json({ message: 'Token is required' });
    }

    try {
      const result = await this.userService.verifyMagicToken(token);
      if (result == null) {
        return res
          .status(400)
          .json({ message: 'This link is invalid or has expired.' });
      }

      if (result.purpose === 'login') {
        const user = await this.userService.getUserById(
          result.userId.toString()
        );
        if (user == null) {
          return res
            .status(400)
            .json({ message: 'This link is invalid or has expired.' });
        }
        const jwtToken = await this.authService.newJWTToken(user.id);
        await this.authService.persistToken(jwtToken, user.id.toString());
        await this.userService.updateLastLoginAt(user.id.toString());
        res.cookie('token', jwtToken);
        return res.status(200).json({ token: jwtToken });
      }

      if (result.purpose === 'password_reset') {
        const user = await this.userService.getUserById(result.userId.toString());
        if (user == null) {
          return res
            .status(400)
            .json({ message: 'This link is invalid or has expired.' });
        }
        const resetToken = crypto.randomUUID();
        await this.userService.updateResetToken(user.id.toString(), resetToken);
        return res.status(200).json({ purpose: 'password_reset', reset_token: resetToken });
      }

      return res
        .status(400)
        .json({ message: 'This link is invalid or has expired.' });
    } catch (error) {
      console.error('Magic link verification failed:', error);
      next(error);
    }
  }

}

export default UsersController;
