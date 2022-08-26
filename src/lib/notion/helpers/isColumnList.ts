import { GetBlockResponse } from '@notionhq/client/build/src/api-endpoints';

export default function isColumnList(block: GetBlockResponse) {
  return block.type === 'column_list';
}
