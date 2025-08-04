import express from 'express';

import RequireAuthentication from './middleware/RequireAuthentication';
import UsersController from '../controllers/UsersControllers';
import UsersRepository from '../data_layer/UsersRepository';
import TokenRepository from '../data_layer/TokenRepository';
import AuthenticationService from '../services/AuthenticationService';
import { getDatabase } from '../data_layer';
import UsersService from '../services/UsersService';
import { useDefaultEmailService } from '../services/EmailService/EmailService';

const UserRouter = () => {
  const router = express.Router();
  const database = getDatabase();
  const authService = new AuthenticationService(
    new TokenRepository(database),
    new UsersRepository(database)
  );

  const emailService = useDefaultEmailService();
  const controller = new UsersController(
    new UsersService(new UsersRepository(database), emailService),
    authService
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
  router.get('/api/users/debug/locals', RequireAuthentication, (req, res) =>
    controller.getLocals(req, res)
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
   * /patreon:
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

  /**
   * @swagger
   * /api/users/avatar:
   *   get:
   *     summary: Get user avatar
   *     description: Get the authenticated user's avatar/profile picture
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *       - cookieAuth: []
   *     responses:
   *       200:
   *         description: Avatar URL or information
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 avatar:
   *                   type: string
   *                   format: uri
   *                   description: Avatar image URL
   *       401:
   *         description: Authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.get('/api/users/avatar', RequireAuthentication, (req, res) =>
    controller.getAvatar(req, res)
  );

  return router;
};

export default UserRouter;
