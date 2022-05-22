import { Request, Response } from 'express';

import { ALLOWED_ORIGINS } from '../lib/constants';

const RequireAllowedOrigin = async (
  req: Request,
  res: Response,
  next: () => any
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
  return next();
};

export default RequireAllowedOrigin;
