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
  const database = getDatabase();
  const authService = new AuthenticationService(
    new TokenRepository(database),
    new UsersRepository(database)
  );
  await configureUserLocal(req, res, authService, database);
  return next();
};

export default RequireAuthentication;
