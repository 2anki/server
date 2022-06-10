import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import express from 'express';
import { Express } from 'express-serve-static-core';

export default class CrashReporter {
  static AddErrorHandler(app: Express) {
    app.use(Sentry.Handlers.errorHandler());
  }

  static Configure(app: express.Application) {
    Sentry.init({
      dsn: 'https://067ae1c6d7c847278d84a7bbd12515ec@o404766.ingest.sentry.io/5965064',
      integrations: [
        // enable HTTP calls tracing
        new Sentry.Integrations.Http({ tracing: true }),
        // enable Express.js middleware tracing
        new Tracing.Integrations.Express({ app }),
      ],

      // Set tracesSampleRate to 1.0 to capture 100%
      // of transactions for performance monitoring.
      // We recommend adjusting this value in production
      tracesSampleRate: 1.0,
    });
    app.use(Sentry.Handlers.requestHandler());
    app.use(Sentry.Handlers.tracingHandler());
  }
}
