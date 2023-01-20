import * as Sentry from '@sentry/node';
import express, { NextFunction } from 'express';

import TokenHandler from '../lib/misc/TokenHandler';

const RequireAuthentication = async (
  req: { cookies: { token: string } },
  res: express.Response,
  next: NextFunction
) => {
  const user = await TokenHandler.GetUserFrom(req.cookies.token);
  if (!user) {
    return res.redirect('/login#login');
  }
  res.locals.owner = user.owner;
  Sentry.setUser({ id: user.owner });
  return next();
};

export default RequireAuthentication;
