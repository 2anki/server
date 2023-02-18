import express, { NextFunction } from 'express';

import TokenHandler from '../lib/misc/TokenHandler';

const RequirePatron = async (
  req: express.Request,
  res: express.Response,
  next: NextFunction
) => {
  const user = await TokenHandler.GetUserFrom(req.cookies.token);
  if (!user || !user.patreon) {
    return res.redirect('/patreon');
  }
  return next();
};

export default RequirePatron;
