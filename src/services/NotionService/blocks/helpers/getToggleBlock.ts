import {
  BlockObjectResponse,
  ToggleBlockObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';

export const getToggleBlock = (block: BlockObjectResponse) => {
  return (block as ToggleBlockObjectResponse).toggle;
};
