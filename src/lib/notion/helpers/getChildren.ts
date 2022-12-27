import { BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';

import BlockHandler from '../BlockHandler';

export default async function getChildren(
  block: BlockObjectResponse,
  handler: BlockHandler
): Promise<string> {
  let backSide = '';
  if (block.has_children) {
    backSide += await handler.getBackSide(block, true);
  }
  return backSide;
}
