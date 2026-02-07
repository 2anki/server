import express from 'express';

import AuthenticationService, {
  UserWithOwner,
} from '../services/AuthenticationService';
import UsersService from '../services/UsersService';
import { getRedirect } from './helpers/getRedirect';

import { getIndexFileContents } from './IndexController/getIndexFileContents';
import { getRandomUUID } from '../shared/helpers/getRandomUUID';
import { getDefaultAvatarPicture } from '../lib/getDefaultAvatarPicture';
import SubscriptionService from '../services/SubscriptionService';

class UsersController {
  constructor(
    private readonly userService: UsersService,
    private readonly authService: AuthenticationService
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
        console.debug(`No user matching email ${email}`);
        return res.status(400).json({
          message: 'Unknown error. Please try again or register a new account.',
        });
      }

      const isMatch = this.authService.comparePassword(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid password.' });
      }

      const token = await this.authService.newJWTToken(user);
      if (token) {
        await this.authService.persistToken(token, user.id.toString());
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
      !this.isValidUser(req.body.password, req.body.name, req.body.email)
    ) {
      res.status(400).json({
        message: 'Invalid user data. Required name, email and password!',
      });
      return;
    }

    const doesUserExist = await this.userService.getUserFrom(req.body.email);
    if (doesUserExist) {
      console.debug('User already exists');
      return res.status(400).json({ message: 'Register failed' });
    }

    const password = this.authService.getHashPassword(req.body.password);
    const { name, email } = req.body;
    try {
      await this.userService.register(
        name,
        password,
        email,
        getDefaultAvatarPicture()
      );
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
    };

    // featureFlags.kiUI = user?.patreon || res.locals.subscriber;

    const response = {
      user: {
        id: user?.id,
        name: user?.name,
        patreon: user?.patreon,
        picture: user?.picture,
        email: user?.email,
      },
      locals,
      linked_email: linkedEmail,
      features: featureFlags, // Add feature flags to response
    };

    return res.json(response);
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

  async deleteAccount(req: express.Request, res: express.Response) {
    const { owner } = res.locals;
    if (!owner && req.body.confirmed === true) {
      return res.status(400).json({});
    }

    try {
      // Get user details before deletion to access email for subscription cancellation
      const user = await this.userService.getUserById(owner);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Cancel active Stripe subscriptions using SubscriptionService
      await SubscriptionService.cancelUserSubscriptions(user.email);

      // Delete the user account
      await this.userService.deleteUser(owner);
      res.status(200).json({});
    } catch (error) {
      console.info('Delete account failed');
      console.error(error);
      return res.status(500).json({ message: 'Failed to delete account' });
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

  public isValidUser(password: string, name: string, email: string) {
    if (!password || !name || !email) {
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
      const { email, name, picture } = loginRequest;
      let user = await this.userService.getUserFrom(email);
      if (!user) {
        // Create user with random password
        await this.userService.register(name, getRandomUUID(), email, picture);
        user = await this.userService.getUserFrom(email);
      }

      if (!user) {
        console.info('Failed to create user');
        return res
          .status(400)
          .send('Unknown error. Please try again or register a new account.');
      }

      if (picture != user.picture) {
        await this.userService.updatePicture(user.id, picture);
      }

      const token = await this.authService.newJWTToken(user);
      if (!token) {
        console.info('Failed to create token');
        return res
          .status(400)
          .send('Unknown error. Please try again or register a new account.');
      }
      await this.authService.persistToken(token, user.id.toString());
      res.cookie('token', token);
      res.status(200).redirect(getRedirect(req));
    } else {
      res.redirect('/login');
    }
  }

  async getAvatar(req: express.Request, res: express.Response) {
    if (!res.locals.owner) {
      return res.status(400).json({ message: 'Missing owner' });
    }

    const user = await this.userService.getUserById(res.locals.owner);
    const name = user.name;
    const picture = user.picture;
    const email = user.email;

    return res.json({ name, picture, email });
  }
}

export default UsersController;
