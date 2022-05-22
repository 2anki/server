import express from 'express';

import NotionAPIWrapper from '../../lib/notion/NotionAPIWrapper';
import NotionID from '../../lib/notion/NotionID';

export default async function getPage(
  api: NotionAPIWrapper,
  query: string,
  res: express.Response,
) {
  const pageId = NotionID.fromString(query);
  const page = await api.getPage(pageId);
  return res.json({ results: [page] });
}
