import express from 'express';
import NotionAPIWrapper from '../../lib/notion/NotionAPIWrapper';

export default async function deleteBlock(
  api: NotionAPIWrapper,
  req: express.Request,
  res: express.Response
) {
  const { id } = req.params;
  if (!id) {
    return res.status(400).send();
  }
  const block = await api.createBlock(id, req.body.newBlock);
  res.json(block);
}
