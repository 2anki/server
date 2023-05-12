import express from 'express';

import NotionAPIWrapper from '../../../lib/notion/NotionAPIWrapper';
import performConversion from '../../../lib/storage/jobs/helpers/performConversion';

export default function convertPage(
  api: NotionAPIWrapper,
  req: express.Request,
  res: express.Response
) {
  const { id, title } = req.body;
  if (!id) {
    return res.status(400).send({ error: 'id is required' });
  }
  return performConversion({
    api,
    id,
    owner: res.locals.owner,
    req,
    res,
    title,
  });
}
