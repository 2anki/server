import { ListBlockChildrenResponse } from '@notionhq/client/build/src/api-endpoints';

import renderTextChildren from './renderTextChildren';
import { styleWithColors } from '../NotionColors';
import BlockHandler from '../BlockHandler';
import getChildren from './getChildren';

type ListType = 'numbered_list_item' | 'bulleted_list_item' | 'to_do';

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
      const backSide = await getChildren(list, handler);
      handler.skip.push(result.id);
      const isTodo = type === 'to_do';
      const checked =
        isTodo && list.checked
          ? 'to-do-children-checked'
          : 'to-do-children-unchecked';
      const checkedClass = isTodo ? checked : '';

      return (
        <li id={result.id} className={`${styleWithColors(list.color)}`}>
          {isTodo && (
            <div
              /* @ts-ignore */
              className={`checkbox checkbox-${list.checked ? 'on' : 'off'}`}
            ></div>
          )}
          <div
            dangerouslySetInnerHTML={{
              __html: renderTextChildren(list.text, handler.settings),
            }}
          />
          {backSide && (
            <div
              className={`${checkedClass}`}
              dangerouslySetInnerHTML={{ __html: backSide }}
            ></div>
          )}
        </li>
      );
    })
  );
}
