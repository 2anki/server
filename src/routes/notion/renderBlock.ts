import express from 'express';
import BlockHandler from '../../lib/notion/BlockHandler';
import renderFront from '../../lib/notion/helpers/renderFront';

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
  const settings = new Settings(Settings.LoadDefaultOptions());
  settings.learnMode = true; // option to handle breaking changes
  let handler = new BlockHandler(
    new CustomExporter('x', new Workspace(true, 'fs').location),
    api,
    settings
  );
  const backSide = await handler.getBackSide(block, false);
  const frontSide = await renderFront(block, handler);

  return res.json({ backSide, frontSide });
}
