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
    case 'heading_2':
    case 'heading_3':
    case 'heading_4':
      return true;
    default:
      return false;
  }
};
