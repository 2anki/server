import { Request, Response, NextFunction } from 'express';

const PROBE_EXTENSIONS =
  /\.(php|env|asp|aspx|jsp|cgi|bak|old|save|sql|htaccess|htpasswd)$/i;

export default function rejectScannerProbes(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.method === 'GET' && PROBE_EXTENSIONS.test(req.path)) {
    res.status(404).end();
    return;
  }
  next();
}
