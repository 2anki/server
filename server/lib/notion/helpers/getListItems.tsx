import { ListBlockChildrenResponse } from '@notionhq/client/build/src/api-endpoints';

import renderTextChildren from './renderTextChildren';
import { styleWithColors } from '../NotionColors';
import BlockHandler from '../BlockHandler';
import getChildren from './getChildren';

type ListType = "numbered_list_item" | "bulleted_list_item";

export default async function getListItems(
  response: ListBlockChildrenResponse,
  handler: BlockHandler,
  type: ListType
) {
  return Promise.all(
    response.results.map(async (result) => {
      /* @ts-ignore */
      const list = result[type];
      if (!list) {
        return null;
      }
      const backSide = await getChildren(result, handler);
      handler.skip.push(result.id);
      return (
        <li
          id={result.id}
          className={`numbered-list${styleWithColors(list.color)}`}
        >
          {renderTextChildren(list.text, handler.settings)}
          {backSide && (
            <div dangerouslySetInnerHTML={{ __html: backSide }}></div>
          )}
        </li>
      );
    })
  );
}
