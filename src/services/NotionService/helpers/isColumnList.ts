import { GetBlockResponse } from '@notionhq/client/build/src/api-endpoints';

interface BlockWithType {
  type: string;
}

export default function isColumnList(block: GetBlockResponse) {
  return (block as BlockWithType).type === 'column_list';
}
