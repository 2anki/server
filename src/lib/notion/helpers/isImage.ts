import { GetBlockResponse } from '@notionhq/client/build/src/api-endpoints';

export const isImage = (block: GetBlockResponse) => {
  /* @ts-ignore */
  return block.type === 'image';
};
