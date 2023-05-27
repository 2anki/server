import express, { NextFunction } from 'express';
import TokenRepository from '../data_layer/TokenRepository';
import UsersRepository from '../data_layer/UsersRepository';
import DB from '../lib/storage/db';
import AuthenticationService from '../services/AuthenticationService';

const RequirePatron = async (
  req: express.Request,
  res: express.Response,
  next: NextFunction
) => {
  const authService = new AuthenticationService(
    new TokenRepository(),
    new UsersRepository(DB)
  );
  const user = await authService.getUserFrom(req.cookies.token);

  if (!user || !user.patreon) {
    return res.redirect('/patreon');
  }

  return next();
};

export default RequirePatron;
