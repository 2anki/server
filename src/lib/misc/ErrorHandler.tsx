import express from 'express';
import { renderToStaticMarkup } from 'react-dom/server';
import { sendError } from '../error/sendError';

const NEW_GITHUB_ISSUE = 'https://github.com/2anki/server/issues/new/choose';
export const NO_PACKAGE_ERROR = new Error(
  renderToStaticMarkup(
    <div className="info">
      Deck creation failed with file/rules. Kindly double-check your{' '}
      <a href="/upload?view=template">settings</a> or submit an issue on{' '}
      <a href={NEW_GITHUB_ISSUE}>GitHub</a>, including an example for reference.
      Could not create a deck using your file and rules.
    </div>
  )
);

export default function ErrorHandler(res: express.Response, err: Error) {
  sendError(err);
  res.set('Content-Type', 'text/plain');
  res.status(400).send(err.message);
}
