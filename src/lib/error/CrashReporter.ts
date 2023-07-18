/* eslint-disable import/no-extraneous-dependencies */
import Bugsnag from '@bugsnag/js';
import BugsnagPluginExpress from '@bugsnag/plugin-express';

import { Express } from 'express-serve-static-core';

export default class CrashReporter {
  /**
   * Add the error handler to the Express app
   * It must be called after setting up all routes.
   * @param app the Express app
   */
  static AddErrorHandler(app: Express) {
    const middleware = Bugsnag.getPlugin('express');
    if (middleware) {
      // This handles any errors that Express catches
      app.use(middleware.errorHandler);
    }
  }

  /**
   * Configure the crash reporter
   * It must be called before setting any routes up.
   * @param app the Express app
   * @param apiKey the Bugsnag API key
   */
  static Configure(app: Express, apiKey: string) {
    Bugsnag.start({
      apiKey,
      plugins: [BugsnagPluginExpress],
    });

    const middleware = Bugsnag.getPlugin('express');
    if (middleware) {
      app.use(middleware.requestHandler);
    }
  }
}
