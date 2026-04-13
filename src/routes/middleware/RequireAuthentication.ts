import express, { NextFunction } from 'express';
import UsersRepository from '../../data_layer/UsersRepository';
import TokenRepository from '../../data_layer/TokenRepository';
import AuthenticationService from '../../services/AuthenticationService';
import { getDatabase } from '../../data_layer';
import { configureUserLocal } from './configureUserLocal';

const RequireAuthentication = async (
  req: express.Request,
  res: express.Response,
  next: NextFunction
) => {
  const shouldDebug = req.query.debug === 'true';
  if (shouldDebug)
    console.info('RequireAuthentication: Starting authentication check');

  const database = getDatabase();
  if (shouldDebug) console.debug('RequireAuthentication: Database initialized');

  const authService = new AuthenticationService(
    new TokenRepository(database),
    new UsersRepository(database)
  );
  if (shouldDebug) console.debug('RequireAuthentication: Auth service created');

  await configureUserLocal(req, res, authService, database);
  if (shouldDebug)
    console.debug('RequireAuthentication: User local configured');

  return next();
};

export default RequireAuthentication;
