import {
  BlockObjectResponse,
  ChildPageBlockObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';

export const getChildPageBlock = (block: BlockObjectResponse) => {
  const page = block as ChildPageBlockObjectResponse;
  return page.child_page;
};
