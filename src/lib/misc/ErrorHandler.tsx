import { renderToStaticMarkup } from 'react-dom/server';
import * as Sentry from '@sentry/node';
import express from 'express';

const ADMIN_EMAIL = 'alexander@alemayhu.com';
export const NO_PACKAGE_ERROR = new Error(
  renderToStaticMarkup(
    <div className="info">
      Could not create a deck using your file and rules. Please review your{' '}
      <a href="/upload?view=template">settings</a> or send an email to{' '}
      <a href={`mailto:${ADMIN_EMAIL}`}> {ADMIN_EMAIL}</a> with the page you
      uploaded.
    </div>
  )
);

export default function ErrorHandler(res: express.Response, err: Error) {
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(err);
  }
  res.set('Content-Type', 'text/plain');
  res.status(400).send(err.message);
}
