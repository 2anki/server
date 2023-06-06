import express, { NextFunction } from 'express';

import TokenRepository from '../data_layer/TokenRepository';
import UsersRepository from '../data_layer/UsersRepository';
import AuthenticationService from '../services/AuthenticationService';
import { getDatabase } from '../data_layer';

const RequirePatron = async (
  req: express.Request,
  res: express.Response,
  next: NextFunction
) => {
  const database = getDatabase();
  const authService = new AuthenticationService(
    new TokenRepository(database),
    new UsersRepository(database)
  );
  const user = await authService.getUserFrom(req.cookies.token);

  if (!user || !user.patreon) {
    return res.redirect('/patreon');
  }

  return next();
};

export default RequirePatron;
