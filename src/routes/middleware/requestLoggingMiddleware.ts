import express from 'express';

import { ObservabilitySink } from '../../services/observability/ObservabilitySink';
import { getObservabilitySink } from '../../services/observability/observabilitySinkInstance';

const OPS_PREFIX = '/ops';

const resolveRoute = (req: express.Request): string => {
  const baseUrl = (req as { baseUrl?: string }).baseUrl ?? '';
  const routePath = req.route?.path;
  if (typeof routePath === 'string' && routePath.length > 0) {
    return `${baseUrl}${routePath}` || routePath;
  }
  return 'unmatched';
};

export const makeRequestLoggingMiddleware = (sink: ObservabilitySink) => {
  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const path = req.path ?? '';
    if (path === OPS_PREFIX || path.startsWith(`${OPS_PREFIX}/`)) {
      return next();
    }
    const start = Date.now();
    res.on('finish', () => {
      try {
        sink.recordRequest({
          method: req.method,
          route: resolveRoute(req),
          status_code: res.statusCode,
          duration_ms: Date.now() - start,
          created_at: new Date(),
        });
      } catch (error) {
        console.error('[observability] failed to record request', error);
      }
    });
    return next();
  };
};

const requestLoggingMiddleware = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => makeRequestLoggingMiddleware(getObservabilitySink())(req, res, next);

export default requestLoggingMiddleware;
