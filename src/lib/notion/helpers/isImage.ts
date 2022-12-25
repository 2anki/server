import { BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';

export const isImage = (block: BlockObjectResponse) => {
  return block.type === 'image' && 'image' in block;
};
