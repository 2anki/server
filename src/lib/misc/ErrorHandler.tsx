import { renderToStaticMarkup } from 'react-dom/server';
import express from 'express';
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

const NOTION_INFO_LINK =
  'https://www.notion.so/help/export-your-content#export-as-html';
export const UNSUPPORTED_FORMAT_MD = new Error(
  renderToStaticMarkup(
    <>
      Markdown support has been removed, please Export as HTML:{' '}
      <a target="_blank" href={NOTION_INFO_LINK}>
        {NOTION_INFO_LINK}
      </a>
    </>
  )
);

export default function ErrorHandler(res: express.Response, err: Error) {
  sendError(err);
  res.set('Content-Type', 'text/plain');
  res.status(400).send(err.message);
}
