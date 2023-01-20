import { captureException } from '@sentry/node';

export const sendError = (error: unknown) => {
  if (error instanceof Error) {
    if (process.env.LOCAL_DEV === 'true') {
      console.error(error);
    } else {
      captureException(error);
    }
  }
};
