import {
  BlockObjectResponse,
  ParagraphBlockObjectResponse,
  PartialBlockObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';
import { isFullBlock } from '@notionhq/client';

export const getParagraphBlocks = (
  results: Array<PartialBlockObjectResponse | BlockObjectResponse>
): Array<ParagraphBlockObjectResponse> =>
  results.filter((block) => {
    if (!isFullBlock(block)) {
      return false;
    }
    return block.type === 'paragraph';
  }) as ParagraphBlockObjectResponse[];
