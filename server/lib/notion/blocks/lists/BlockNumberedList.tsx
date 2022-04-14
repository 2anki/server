import { GetBlockResponse } from '@notionhq/client/build/src/api-endpoints';
import ReactDOMServer from 'react-dom/server';
import BlockHandler from '../../BlockHandler';
import { styleWithColors } from '../../NotionColors';
import HandleBlockAnnotations from '../utils';
import { convert } from "html-to-text"

export const BlockNumberedList = (
  block: GetBlockResponse,
  handler: BlockHandler
) => {
  /* @ts-ignore */
  const list = block.numbered_list_item;
  const text = list.text;
  const markup = ReactDOMServer.renderToStaticMarkup(
    <ol id={block.id} className={`numbered-list${styleWithColors(list.color)}`}>
      {text.map((t: GetBlockResponse) => {
        /* @ts-ignore */
        const annotations = t.annotations;
        /* @ts-ignore */
        return (
          <li>
            {/* @ts-ignore */}
            {HandleBlockAnnotations(annotations, t.text)}
          </li>
        );
      })}
    </ol>
  );
  if (handler.settings?.isTextOnlyBack) {
    return convert(markup);
  }
  return markup;
};
