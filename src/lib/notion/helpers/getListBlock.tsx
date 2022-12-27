import {
  BlockObjectResponse,
  BulletedListItemBlockObjectResponse,
  NumberedListItemBlockObjectResponse,
  PartialBlockObjectResponse,
  ToDoBlockObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';
import { isFullBlock } from '@notionhq/client';

export function getListBlock(
  result: PartialBlockObjectResponse | BlockObjectResponse
) {
  if (!isFullBlock(result)) {
    return undefined;
  }
  switch (result.type) {
    case 'bulleted_list_item':
      return result as BulletedListItemBlockObjectResponse;
    case 'to_do':
      return result as ToDoBlockObjectResponse;
    case 'numbered_list_item':
      return result as NumberedListItemBlockObjectResponse;
    default:
      return undefined;
  }
}
