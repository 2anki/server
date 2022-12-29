import { ColumnBlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import BlockHandler from '../../BlockHandler/BlockHandler';
import getChildren from '../../helpers/getChildren';

export default async function BlockColumn(
  block: ColumnBlockObjectResponse,
  handler: BlockHandler
) {
  return getChildren(block, handler);
}
