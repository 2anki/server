import express from 'express';
import AuthenticationService from '../../services/AuthenticationService';
import UsersRepository from '../../data_layer/UsersRepository';
import TokenRepository from '../../data_layer/TokenRepository';
import { getDatabase } from '../../data_layer';

export const ensureIsLoggedIn = async (
  req: express.Request,
  res: express.Response,
): Promise<boolean> => {
  const authService = new AuthenticationService(
    new TokenRepository(getDatabase()),
    new UsersRepository(getDatabase())
  );
  const user = await authService.getUserFrom(req.cookies.token);
  if (!user) {
    res.redirect('/login');
    return false;
  } else {
    return true;
  }
};