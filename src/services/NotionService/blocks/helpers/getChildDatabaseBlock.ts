import {
  BlockObjectResponse,
  ChildDatabaseBlockObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';

export const getChildDatabaseBlock = (block: BlockObjectResponse) => {
  const page = block as ChildDatabaseBlockObjectResponse;
  return page.child_database;
};
