import { Request, Response, NextFunction } from 'express';
import AuthenticationService from '../../services/AuthenticationService';
import TokenRepository from '../../data_layer/TokenRepository';
import UsersRepository from '../../data_layer/UsersRepository';
import { getDatabase } from '../../data_layer';

export const makeOptionalAuthMiddleware = (
  authService: AuthenticationService
) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const token = req.cookies?.token;
    if (token) {
      const user = await authService.getUserFrom(token);
      if (user) {
        res.locals.owner = user.owner;
      }
    }
    next();
  };
};

export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const database = getDatabase();
  const authService = new AuthenticationService(
    new TokenRepository(database),
    new UsersRepository(database)
  );
  return makeOptionalAuthMiddleware(authService)(req, res, next);
};
