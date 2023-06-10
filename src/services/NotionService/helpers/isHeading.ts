import {
  BlockObjectResponse,
  PartialBlockObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';
import { isFullBlock } from '@notionhq/client';

export const isHeading = (
  block: BlockObjectResponse | PartialBlockObjectResponse
): boolean => {
  if (!isFullBlock(block)) {
    return false;
  }

  switch (block.type) {
    case 'heading_1':
      return true;
    case 'heading_2':
      return true;
    case 'heading_3':
      return true;
    default:
      return false;
  }
};
