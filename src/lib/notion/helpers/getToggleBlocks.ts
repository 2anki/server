import {
  BlockObjectResponse,
  PartialBlockObjectResponse,
  ToggleBlockObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';
import { isFullBlock } from '@notionhq/client';

export const getToggleBlocks = (
  results: Array<PartialBlockObjectResponse | BlockObjectResponse>
): Array<ToggleBlockObjectResponse> =>
  results.filter((block) => {
    if (!isFullBlock(block)) {
      return false;
    }
    return block.type === 'toggle';
  }) as ToggleBlockObjectResponse[];
