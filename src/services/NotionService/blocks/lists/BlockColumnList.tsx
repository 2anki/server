import { ColumnListBlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import BlockHandler from '../../BlockHandler/BlockHandler';
import getChildren from '../../helpers/getChildren';
import getColumn from '../../helpers/getColumn';
import BlockColumn from './BlockColumn';

export default async function BlockColumnList(
  block: ColumnListBlockObjectResponse,
  handler: BlockHandler
) {
  const firstColumn = await getColumn(block.id, handler, 0);
  if (firstColumn) {
    return BlockColumn(firstColumn, handler);
  }
  return getChildren(block, handler);
}
