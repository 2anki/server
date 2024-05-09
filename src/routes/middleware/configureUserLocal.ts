import { Request, Response } from 'express';
import AuthenticationService from '../../services/AuthenticationService';
import { Knex } from 'knex';

export async function configureUserLocal(
  req: Request,
  res: Response,
  authService: AuthenticationService,
  database: Knex
) {
  const user = await authService.getUserFrom(req.cookies.token);
  if (user) {
    res.locals.owner = user.owner;
    res.locals.patreon = user.patreon;
    res.locals.subscriber = await authService.getIsSubscriber(
      database,
      user.email
    );
  }
}
