import {
  BlockObjectResponse,
  BulletedListItemBlockObjectResponse,
  NumberedListItemBlockObjectResponse,
  ToDoBlockObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';

export const getListColor = (block: BlockObjectResponse) => {
  switch (block.type) {
    case 'to_do':
      return (block as ToDoBlockObjectResponse).to_do.color;
    case 'bulleted_list_item':
      return (block as BulletedListItemBlockObjectResponse).bulleted_list_item
        .color;
    case 'numbered_list_item':
      return (block as NumberedListItemBlockObjectResponse).numbered_list_item
        .color;
    default:
      return undefined;
  }
};
