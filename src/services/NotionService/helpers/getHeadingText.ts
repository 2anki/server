import { isFullBlock } from '@notionhq/client';
import { BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { getHeading } from '../blocks/helpers/getHeading';

export const getHeadingText = (block: BlockObjectResponse) => {
  if (!isFullBlock(block)) {
    return undefined;
  }
  const heading = getHeading(block);
  return heading?.rich_text;
};
