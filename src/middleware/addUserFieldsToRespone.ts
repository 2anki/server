import { Request, Response } from 'express';
import TokenHandler from '../lib/misc/TokenHandler';

export const addUserFieldsToResponse = async (req: Request, res: Response) => {
  if (!req.cookies.token) {
    return;
  }

  const user = await TokenHandler.GetUserFrom(req.cookies.token);
  if (user) {
    res.locals.owner = user.owner;
    res.locals.patreon = user.patreon;
  }
};
