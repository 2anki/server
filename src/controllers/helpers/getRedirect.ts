import { Request } from 'express';

export const getRedirect = (req: Request): string =>
  req.query.redirect?.toString() ?? '/search';
