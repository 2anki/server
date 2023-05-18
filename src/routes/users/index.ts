import express from 'express';

import DB from '../../lib/storage/db';

import RequireAuthentication from '../../middleware/RequireAuthentication';
import UsersController from '../../controllers/UsersControllers';
import UsersRepository from '../../data_layer/UsersRepository';

const UserRouter = () => {
  const router = express.Router();
  const controller = new UsersController(new UsersRepository(DB));

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

  return router;
};

export default UserRouter;
