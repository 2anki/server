import { NextFunction, Request, Response } from 'express';

import { ALLOWED_ORIGINS } from '../lib/constants';
import AuthenticationService from '../services/AuthenticationService';
import UsersRepository from '../data_layer/UsersRepository';
import TokenRepository from '../data_layer/TokenRepository';
import DB from '../lib/storage/db';

const RequireAllowedOrigin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { origin } = req.headers;
  if (!origin) {
    return res.status(400).send('unknown origin');
  }
  const permitted = ALLOWED_ORIGINS.includes(origin);
  console.info(`checking if ${origin} is whitelisted ${permitted}`);
  if (!permitted) {
    return res.status(403).end();
  }
  console.info(`permitted access to ${origin}`);
  res.set('Access-Control-Allow-Origin', origin);

  if (!req.cookies.token) {
    return;
  }

  const authService = new AuthenticationService(
    new TokenRepository(),
    new UsersRepository(DB)
  );
  const user = await authService.getUserFrom(req.cookies.token);
  if (user) {
    res.locals.owner = user.owner;
    res.locals.patreon = user.patreon;
  }
  return next();
};

export default RequireAllowedOrigin;
