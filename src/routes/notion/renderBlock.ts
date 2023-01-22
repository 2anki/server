import express from 'express';
import BlockHandler from '../../lib/notion/BlockHandler/BlockHandler';

import NotionAPIWrapper from '../../lib/notion/NotionAPIWrapper';
import CustomExporter from '../../lib/parser/CustomExporter';
import Settings from '../../lib/parser/Settings';
import Workspace from '../../lib/parser/WorkSpace';
import { blockToStaticMarkup } from '../../lib/notion/helpers/blockToStaticMarkup';
import { BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { getNotionId } from '../../lib/notion/getNotionId';

export default async function renderBlock(
  api: NotionAPIWrapper,
  query: string,
  res: express.Response
) {
  const blockId = getNotionId(query) ?? query;
  const block = await api.getBlock(blockId);
  const settings = new Settings(Settings.LoadDefaultOptions());
  settings.learnMode = true; // option to handle breaking changes
  let handler = new BlockHandler(
    new CustomExporter('x', new Workspace(true, 'fs').location),
    api,
    settings
  );
  await handler.getBackSide(block as BlockObjectResponse, false);
  const frontSide = await blockToStaticMarkup(
    handler,
    block as BlockObjectResponse
  );
  return res.json({ html: frontSide });
}
