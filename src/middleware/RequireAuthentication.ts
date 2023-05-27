import * as Sentry from '@sentry/node';
import express, { NextFunction } from 'express';
import UsersRepository from '../data_layer/UsersRepository';
import TokenRepository from '../data_layer/TokenRepository';
import DB from '../lib/storage/db';
import AuthenticationService from '../services/AuthenticationService';

const RequireAuthentication = async (
  req: express.Request,
  res: express.Response,
  next: NextFunction
) => {
  const authService = new AuthenticationService(
    new TokenRepository(),
    new UsersRepository(DB)
  );
  const user = await authService.getUserFrom(req.cookies.token);
  if (!user) {
    return res.redirect('/login#login');
  }
  res.locals.owner = user.owner;
  res.locals.patreon = user.patreon;
  Sentry.setUser({ id: user.owner.toString() });
  return next();
};

export default RequireAuthentication;
