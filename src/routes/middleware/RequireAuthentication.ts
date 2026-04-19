import express, { NextFunction } from 'express';
import UsersRepository from '../../data_layer/UsersRepository';
import TokenRepository from '../../data_layer/TokenRepository';
import AuthenticationService from '../../services/AuthenticationService';
import { getDatabase } from '../../data_layer';
import { configureUserLocal } from './configureUserLocal';

async function attachUserLocals(req: express.Request, res: express.Response) {
  const database = getDatabase();
  const authService = new AuthenticationService(
    new TokenRepository(database),
    new UsersRepository(database)
  );
  await configureUserLocal(req, res, authService, database);
}

export const OptionalAuthentication = async (
  req: express.Request,
  res: express.Response,
  next: NextFunction
) => {
  await attachUserLocals(req, res);
  return next();
};

const RequireAuthentication = async (
  req: express.Request,
  res: express.Response,
  next: NextFunction
) => {
  await attachUserLocals(req, res);
  if (!res.locals.owner) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  return next();
};

export default RequireAuthentication;
