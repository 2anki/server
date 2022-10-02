import { GetBlockResponse } from '@notionhq/client/build/src/api-endpoints';

export const getImageUrl = (block: GetBlockResponse) =>
  /* @ts-ignore */
  block.image.file.url;
