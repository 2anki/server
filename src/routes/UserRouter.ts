import express from 'express';

import RequireAuthentication from './middleware/RequireAuthentication';
import UsersController from '../controllers/UsersControllers';
import UsersRepository from '../data_layer/UsersRepository';
import TokenRepository from '../data_layer/TokenRepository';
import AuthenticationService from '../services/AuthenticationService';
import { getDatabase } from '../data_layer';
import UsersService from '../services/UsersService';

const UserRouter = () => {
  const router = express.Router();
  const database = getDatabase();
  const authService = new AuthenticationService(
    new TokenRepository(database),
    new UsersRepository(database)
  );
  const controller = new UsersController(
    new UsersService(new UsersRepository(database)),
    authService
  );

  // No authentication required for new password since user has reset token
  router.post('/api/users/new-password', (req, res, next) =>
    controller.newPassword(req, res, next)
  );
  // Forgot password triggers email with reset token
  router.post('/api/users/forgot-password', (req, res, next) =>
    controller.forgotPassword(req, res, next)
  );

  router.post('/api/users/logout', RequireAuthentication, (req, res, next) =>
    controller.logOut(req, res, next)
  );
  router.post('/api/users/login', (req, res, next) =>
    controller.login(req, res, next)
  );
  router.post('/api/users/register', (req, res, next) =>
    controller.register(req, res, next)
  );
  router.get('/api/users/r/:id', (req, res, next) =>
    controller.resetPassword(req, res, next)
  );
  router.post('/api/users/delete-account', RequireAuthentication, (req, res) =>
    controller.deleteAccount(req, res)
  );
  router.get('/api/users/debug/locals', RequireAuthentication, (req, res) =>
    controller.getLocals(req, res)
  );
  router.get('/login', (req, res) => controller.checkUser(req, res));
  router.get('/patr*on', (req, res) => controller.patreon(req, res));

  return router;
};

export default UserRouter;
