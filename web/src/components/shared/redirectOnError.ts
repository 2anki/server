import { captureException } from '@sentry/react';

export const redirectOnError = (error: unknown) => {
  captureException(error);
  window.location.href = '/login#login';
};
