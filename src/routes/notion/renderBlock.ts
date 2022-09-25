import express from 'express';
import BlockHandler from '../../lib/notion/BlockHandler';

import NotionAPIWrapper from '../../lib/notion/NotionAPIWrapper';
import NotionID from '../../lib/notion/NotionID';
import CustomExporter from '../../lib/parser/CustomExporter';
import Settings from '../../lib/parser/Settings';
import Workspace from '../../lib/parser/WorkSpace';

export default async function renderBlock(
  api: NotionAPIWrapper,
  query: string,
  res: express.Response
) {
  const blockId = NotionID.fromString(query);
  const block = await api.getBlock(blockId);
  let handler = new BlockHandler(
    new CustomExporter('x', new Workspace(true, 'fs').location),
    api,
    new Settings(Settings.LoadDefaultOptions())
  );
  const data = await handler.getBackSide(block, false);

  return res.json({ data });
}
