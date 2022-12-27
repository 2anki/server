import { GetBlockResponse } from '@notionhq/client/build/src/api-endpoints';
import { isFullBlock } from '@notionhq/client';

export default function isToggle(block: GetBlockResponse): boolean {
  if (!isFullBlock(block)) {
    return false;
  }
  return block.type === 'toggle';
}
