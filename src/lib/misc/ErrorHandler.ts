import * as Sentry from '@sentry/node';
import express from 'express';

export default function ErrorHandler(res: express.Response, err: Error) {
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(err);
  }
  res.set('Content-Type', 'text/plain');
  res.status(400).send(err.message);
}
