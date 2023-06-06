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
  router.post('/api/users/new-password', controller.newPassword);
  // Forgot password triggers email with reset token
  router.post('/api/users/forgot-password', controller.forgotPassword);

  router.post('/api/users/logout', RequireAuthentication, controller.logOut);
  router.post('/api/users/login', controller.login);
  router.post('/api/users/register', controller.register);
  router.get('/api/users/r/:id', controller.resetPassword);
  router.post(
    '/api/users/delete-account',
    RequireAuthentication,
    controller.deleteAccount
  );
  router.get(
    '/api/users/debug/locals',
    RequireAuthentication,
    controller.getLocals
  );
  router.get('/login', controller.checkUser);
  router.get('/patr*on', controller.patreon);

  return router;
};

export default UserRouter;
