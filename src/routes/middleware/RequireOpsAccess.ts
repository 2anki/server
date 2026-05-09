import express from 'express';

import AuthenticationService from '../../services/AuthenticationService';
import TokenRepository from '../../data_layer/TokenRepository';
import UsersRepository from '../../data_layer/UsersRepository';
import { getDatabase } from '../../data_layer';

export const OPS_OWNER_EMAIL = 'alexander@alemayhu.com';

const respondNotFound = (res: express.Response) => {
  res.status(404).end();
};

export const makeRequireOpsAccess = (authService: AuthenticationService) => {
  return async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const token = req.cookies?.token;
    if (token == null) {
      respondNotFound(res);
      return;
    }
    const user = await authService.getUserFrom(token);
    if (user == null || user.email == null) {
      respondNotFound(res);
      return;
    }
    if (user.email.toLowerCase() !== OPS_OWNER_EMAIL) {
      respondNotFound(res);
      return;
    }
    res.locals.owner = user.owner;
    res.locals.email = user.email;
    next();
  };
};

const RequireOpsAccess = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const database = getDatabase();
  const authService = new AuthenticationService(
    new TokenRepository(database),
    new UsersRepository(database)
  );
  return makeRequireOpsAccess(authService)(req, res, next);
};

export default RequireOpsAccess;
