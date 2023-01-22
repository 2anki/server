import express from 'express';
import NotionAPIWrapper from '../../lib/notion/NotionAPIWrapper';

export default async function getBlocks(
  api: NotionAPIWrapper,
  req: express.Request,
  res: express.Response
) {
  console.info('[NO_CACHE] - getBlocks');
  const { id } = req.params;
  if (!id) {
    return res.status(400).send();
  }
  const blocks = await api.getBlocks({
    all: true,
    createdAt: '',
    lastEditedAt: '',
    id,
  });
  res.json(blocks);
}
