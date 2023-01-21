import express from 'express';

import NotionAPIWrapper from '../../lib/notion/NotionAPIWrapper';
import { getNotionId } from '../../lib/notion/getNotionId';

export default async function getPage(
  api: NotionAPIWrapper,
  query: string,
  res: express.Response
) {
  const pageId = getNotionId(query) ?? query;
  const page = await api.getPage(pageId);
  return res.json({ results: [page] });
}
