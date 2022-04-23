import {
  GetBlockResponse,
  ListBlockChildrenResponse,
} from '@notionhq/client/build/src/api-endpoints';
import ReactDOMServer from 'react-dom/server';
import BlockHandler from '../../BlockHandler';
import { styleWithColors } from '../../NotionColors';
import { convert } from 'html-to-text';
import getListItems from '../../helpers/getListItems';

export const BlockNumberedList = async (
  block: GetBlockResponse,
  response: ListBlockChildrenResponse,
  handler: BlockHandler
) => {
  /* @ts-ignore */
  const list = block.numbered_list_item;
  const items = await getListItems(response, handler, "numbered_list_item");
  const listItems = items.filter(Boolean);
  const markup = ReactDOMServer.renderToStaticMarkup(
    <ol id={block.id} className={`numbered-list${styleWithColors(list.color)}`}>
      {listItems}
    </ol>
  );
  if (handler.settings?.isTextOnlyBack) {
    return convert(markup);
  }
  return markup;
};
