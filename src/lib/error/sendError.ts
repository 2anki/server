/* eslint-disable import/no-extraneous-dependencies */
import Bugsnag from '@bugsnag/js';

export const sendError = (error: unknown) => {
  if (error instanceof Error) {
    if (process.env.LOCAL_DEV === 'true') {
      console.error(error);
    } else if (process.env.NODE_ENV === 'production') {
      Bugsnag.notify(error);
    }
  }
};
