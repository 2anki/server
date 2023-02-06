import { GetBlockResponse } from '@notionhq/client/build/src/api-endpoints';
import BlockHandler from '../BlockHandler/BlockHandler';

export default async function getColumn(
  parentId: string,
  handler: BlockHandler,
  index: number
): Promise<GetBlockResponse | null> {
  console.time('[NO_CACHE] - getColumn');
  const getBlocks = await handler.api.getBlocks({
    createdAt: '',
    lastEditedAt: '',
    id: parentId,
  });
  const blocks = getBlocks?.results;
  if (blocks?.length > 0 && blocks?.length >= index + 1) {
    console.timeEnd('[NO_CACHE] - getColumn');
    return blocks[index];
  }
  console.timeEnd('[NO_CACHE] - getColumn');
  return null;
}
