import express from 'express';

import TokenHandler from '../lib/misc/TokenHandler';

const RequireAuthentication = async (
  req: { cookies: { token: string } },
  res: express.Response,
  next: () => void
) => {
  const user = await TokenHandler.GetUserFrom(req.cookies.token);
  if (!user) {
    return res.redirect('/login#login');
  }
  res.locals.owner = user.owner;
  res.locals.patreon = user.patreon;
  return next();
};

export default RequireAuthentication;
