import express from 'express';
import { getIndexFileContents } from './getIndexFileContents';

const BUILD_PENDING_BODY =
  'The site is being updated. Refresh in a few seconds.';

export const sendIndex = (response: express.Response) => {
  const html = getIndexFileContents();
  if (html == null) {
    response.set('Retry-After', '5');
    return response.status(503).send(BUILD_PENDING_BODY);
  }
  return response.send(html);
};
