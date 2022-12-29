import { GetBlockResponse } from '@notionhq/client/build/src/api-endpoints';
import BlockHandler from '../BlockHandler/BlockHandler';

export default async function getColumn(
  parentId: string,
  handler: BlockHandler,
  index: number
): Promise<GetBlockResponse | null> {
  const getBlocks = await handler.api.getBlocks(parentId);
  const blocks = getBlocks?.results;
  if (blocks?.length > 0 && blocks?.length >= index + 1) {
    return blocks[index];
  }
  return null;
}
