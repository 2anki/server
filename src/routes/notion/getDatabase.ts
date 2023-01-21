import express from 'express';
import NotionAPIWrapper from '../../lib/notion/NotionAPIWrapper';
import { getNotionId } from '../../lib/notion/getNotionId';
import { sendError } from '../../lib/error/sendError';

export default async function getDatabase(
  api: NotionAPIWrapper,
  req: express.Request,
  res: express.Response
) {
  try {
    let { id } = req.params;
    if (!id) {
      return res.status(400).send();
    }
    id = id.replace(/-/g, '');
    if (id.includes('/')) {
      id = getNotionId(req.params.id) ?? id;
    }
    const database = await api.getDatabase(id);
    console.log('database', database);
    res.json(database);
  } catch (error) {
    sendError(error);
    res.status(500).send();
  }
}
