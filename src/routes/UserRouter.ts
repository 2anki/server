import express from 'express';

import RequireAuthentication, {
  OptionalAuthentication,
} from './middleware/RequireAuthentication';
import UsersController from '../controllers/UsersControllers';
import { EmailPreferencesController } from '../controllers/EmailPreferencesController';
import { UserPreferencesController } from '../controllers/UserPreferencesController';
import UsersRepository from '../data_layer/UsersRepository';
import TokenRepository from '../data_layer/TokenRepository';
import EmailPreferencesRepository from '../data_layer/EmailPreferencesRepository';
import UserPreferencesRepository from '../data_layer/UserPreferencesRepository';
import AuthenticationService from '../services/AuthenticationService';
import { getDatabase } from '../data_layer';
import UsersService from '../services/UsersService';
import { getDefaultEmailService } from '../services/EmailService/EmailService';
import { MagicTokenRepository } from '../data_layer/MagicTokenRepository';

const UserRouter = () => {
  const router = express.Router();
  const database = getDatabase();
  const authService = new AuthenticationService(
    new TokenRepository(database),
    new UsersRepository(database)
  );

  const emailService = getDefaultEmailService();
  const magicTokenRepository = new MagicTokenRepository(database);
  const controller = new UsersController(
    new UsersService(new UsersRepository(database), emailService, magicTokenRepository),
    authService,
    database
  );
  const emailPreferencesController = new EmailPreferencesController(
    new EmailPreferencesRepository(database)
  );
  const userPreferencesController = new UserPreferencesController(
    new UserPreferencesRepository(database)
  );

  // No authentication required for new password since user has reset token
  /**
   * @swagger
   * /api/users/new-password:
   *   post:
   *     summary: Set new password
   *     description: Set a new password using a reset token received via email
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - token
   *               - password
   *             properties:
   *               token:
   *                 type: string
   *                 description: Reset token from email
   *               password:
   *                 type: string
   *                 minLength: 8
   *                 description: New password (minimum 8 characters)
   *     responses:
   *       200:
   *         description: Password updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Success'
   *       400:
   *         description: Invalid token or password
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post('/api/users/new-password', (req, res, next) =>
    controller.newPassword(req, res, next)
  );

  // Forgot password triggers email with reset token
  /**
   * @swagger
   * /api/users/forgot-password:
   *   post:
   *     summary: Request password reset
   *     description: Send a password reset email to the user
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 description: User email address
   *     responses:
   *       200:
   *         description: Password reset email sent
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Success'
   *       404:
   *         description: Email not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post('/api/users/forgot-password', (req, res, next) =>
    controller.forgotPassword(req, res, next)
  );

  /**
   * @swagger
   * /api/users/magic-link:
   *   post:
   *     summary: Request a magic login link
   *     description: Sends a magic link email for passwordless login or password reset. Always returns 200 to prevent email enumeration.
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [email]
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *               purpose:
   *                 type: string
   *                 enum: [login, password_reset]
   *                 default: login
   *     responses:
   *       200:
   *         description: Magic link sent (or silently ignored if email not found)
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Success'
   *       429:
   *         description: Too many requests
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post('/api/users/magic-link', (req, res, next) =>
    controller.requestMagicLink(req, res, next)
  );

  /**
   * @swagger
   * /api/users/magic/{token}:
   *   get:
   *     summary: Verify a magic link token
   *     description: Validates a magic link token and creates a session for login, or returns token info for password reset.
   *     tags: [Authentication]
   *     parameters:
   *       - in: path
   *         name: token
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Token valid — session created (login) or reset info returned (password_reset)
   *       400:
   *         description: Token invalid or expired
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.get('/api/users/magic/:token', (req, res, next) =>
    controller.verifyMagicLink(req, res, next)
  );

  /**
   * @swagger
   * /api/users/verify/{token}:
   *   get:
   *     summary: Verify email address
   *     description: Validates an email verification token, marks the user's email as verified, and redirects to the app.
   *     tags: [Authentication]
   *     parameters:
   *       - in: path
   *         name: token
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       302:
   *         description: Redirects to /uploads on success, or /login?error=verification-expired on failure
   */
  router.get('/api/users/verify/:token', (req, res, next) =>
    controller.verifyEmail(req, res, next)
  );

  /**
   * @swagger
   * /api/users/logout:
   *   post:
   *     summary: Logout user
   *     description: Logout the authenticated user and invalidate session
   *     tags: [Authentication]
   *     security:
   *       - bearerAuth: []
   *       - cookieAuth: []
   *     responses:
   *       200:
   *         description: Logged out successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Success'
   *       401:
   *         description: Authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post('/api/users/logout', RequireAuthentication, (req, res, next) =>
    controller.logOut(req, res, next)
  );

  /**
   * @swagger
   * /api/users/login:
   *   post:
   *     summary: Login user
   *     description: Authenticate user with email and password
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 description: User email address
   *               password:
   *                 type: string
   *                 description: User password
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 token:
   *                   type: string
   *                   description: JWT authentication token
   *                 user:
   *                   $ref: '#/components/schemas/User'
   *       401:
   *         description: Invalid credentials
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post('/api/users/login', (req, res, next) =>
    controller.login(req, res, next)
  );

  /**
   * @swagger
   * /api/users/register:
   *   post:
   *     summary: Register new user
   *     description: Create a new user account
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 description: User email address
   *               password:
   *                 type: string
   *                 minLength: 8
   *                 description: User password (minimum 8 characters)
   *               name:
   *                 type: string
   *                 description: User's full name
   *     responses:
   *       201:
   *         description: User registered successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 token:
   *                   type: string
   *                   description: JWT authentication token
   *                 user:
   *                   $ref: '#/components/schemas/User'
   *       400:
   *         description: Email already exists or invalid input
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post('/api/users/register', (req, res, next) =>
    controller.register(req, res, next)
  );

  /**
   * @swagger
   * /api/users/r/{id}:
   *   get:
   *     summary: Password reset redirect
   *     description: Handle password reset token and redirect to reset page
   *     tags: [Authentication]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Password reset token ID
   *     responses:
   *       302:
   *         description: Redirect to password reset page
   *       400:
   *         description: Invalid or expired token
   *         content:
   *           text/html:
   *             schema:
   *               type: string
   *               description: Error page
   */
  router.get('/api/users/r/:id', (req, res, next) =>
    controller.resetPassword(req, res, next)
  );

  /**
   * @swagger
   * /api/users/delete-account:
   *   post:
   *     summary: Delete user account
   *     description: Permanently delete the authenticated user's account and all associated data
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *       - cookieAuth: []
   *     responses:
   *       200:
   *         description: Account deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Success'
   *       401:
   *         description: Authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post('/api/users/delete-account', RequireAuthentication, (req, res) =>
    controller.deleteAccount(req, res)
  );

  router.post(
    '/api/users/request-hosted-anki-access',
    RequireAuthentication,
    (req, res) => controller.requestHostedAnkiAccess(req, res)
  );

  /**
   * @swagger
   * /api/users/cancel-subscription:
   *   post:
   *     summary: Cancel user subscription
   *     description: Cancel the authenticated user's active subscription without deleting the account
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *       - cookieAuth: []
   *     responses:
   *       200:
   *         description: Subscription cancelled successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Success'
   *       401:
   *         description: Authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: User or active subscription not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post('/api/users/cancel-subscription', RequireAuthentication, (req, res) =>
    controller.cancelSubscription(req, res)
  );

  /**
   * @swagger
   * /api/users/subscription-status:
   *   get:
   *     summary: Get live subscription status from Stripe
   *     description: Returns active subscriptions for the authenticated user, fetched directly from Stripe
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *       - cookieAuth: []
   *     responses:
   *       200:
   *         description: Subscription status retrieved
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 subscriptions:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: string
   *                       status:
   *                         type: string
   *                       cancel_at_period_end:
   *                         type: boolean
   *                       current_period_end:
   *                         type: integer
   *                         nullable: true
   *       401:
   *         description: Authentication required
   */
  router.get('/api/users/subscription-status', RequireAuthentication, (req, res) =>
    controller.getSubscriptionStatus(req, res)
  );

  /**
   * @swagger
   * /api/users/debug/locals:
   *   get:
   *     summary: Get debug information
   *     description: Get debugging information about the current user session (development only)
   *     tags: [Debug]
   *     security:
   *       - bearerAuth: []
   *       - cookieAuth: []
   *     responses:
   *       200:
   *         description: Debug information retrieved
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               additionalProperties: true
   *       401:
   *         description: Authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.get('/api/users/debug/locals', OptionalAuthentication, (req, res) =>
    controller.getLocals(req, res)
  );

  router.post(
    '/api/users/debug/ankify-welcome-seen',
    RequireAuthentication,
    (req, res) => controller.markAnkifyWelcomeSeen(req, res)
  );

  router.post(
    '/api/users/start-trial',
    RequireAuthentication,
    (req, res) => controller.startTrial(req, res)
  );

  /**
   * @swagger
   * /login:
   *   get:
   *     summary: Check user authentication
   *     description: Check if user is authenticated and return user information
   *     tags: [Authentication]
   *     responses:
   *       200:
   *         description: User information or authentication status
   *         content:
   *           application/json:
   *             schema:
   *               oneOf:
   *                 - $ref: '#/components/schemas/User'
   *                 - type: object
   *                   properties:
   *                     authenticated:
   *                       type: boolean
   *                       example: false
   */
  router.get('/login', (req, res) => controller.checkUser(req, res));

  /**
   * @swagger
   * /patr*on:
   *   get:
   *     summary: Patreon integration
   *     description: Handle Patreon authentication callback and redirects (supports /patreon)
   *     tags: [Authentication]
   *     responses:
   *       302:
   *         description: Redirect after Patreon authentication
   *       200:
   *         description: Patreon integration page
   *         content:
   *           text/html:
   *             schema:
   *               type: string
   */
  router.get('/patr*on', (req, res) => controller.patreon(req, res));

  /**
   * @swagger
   * /api/users/link_email:
   *   post:
   *     summary: Link email to account
   *     description: Link an email address to the authenticated user's account
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *       - cookieAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 description: Email address to link
   *     responses:
   *       200:
   *         description: Email linked successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Success'
   *       400:
   *         description: Invalid email or email already in use
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post('/api/users/link_email', RequireAuthentication, (req, res) =>
    controller.linkEmail(req, res)
  );

  /**
   * @swagger
   * /api/users/auth/google:
   *   get:
   *     summary: Google OAuth authentication
   *     description: Initiate Google OAuth authentication flow
   *     tags: [Authentication]
   *     responses:
   *       302:
   *         description: Redirect to Google OAuth
   */
  router.get('/api/users/auth/google', (req, res) =>
    controller.loginWithGoogle(req, res)
  );


  router.get(
    '/api/users/email-preferences',
    RequireAuthentication,
    (req, res) => emailPreferencesController.get(req, res)
  );

  router.patch(
    '/api/users/email-preferences',
    RequireAuthentication,
    (req, res) => emailPreferencesController.update(req, res)
  );

  router.get(
    '/api/users/me/preferences',
    RequireAuthentication,
    (req, res) => userPreferencesController.get(req, res)
  );

  router.patch(
    '/api/users/me/preferences',
    RequireAuthentication,
    (req, res) => userPreferencesController.patch(req, res)
  );

  router.post(
    '/api/users/me/preferences/migrate',
    RequireAuthentication,
    (req, res) => userPreferencesController.migrate(req, res)
  );

  return router;
};

export default UserRouter;
