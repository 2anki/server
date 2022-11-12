import express from 'express';

import NotionAPIWrapper from '../../lib/notion/NotionAPIWrapper';

export async function queryDatabase(
  api: NotionAPIWrapper,
  req: express.Request,
  res: express.Response
) {
  const { id } = req.params;
  if (!id) {
    return res.status(400).send();
  }
  const results = await api.queryDatabase(id);
  res.json(results);
}
