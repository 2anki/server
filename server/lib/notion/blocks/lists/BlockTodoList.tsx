import { GetBlockResponse } from '@notionhq/client/build/src/api-endpoints';
import ReactDOMServer from 'react-dom/server';
import BlockHandler from '../../BlockHandler';
import { styleWithColors } from '../../NotionColors';
import HandleBlockAnnotations from '../utils';
import { convert } from "html-to-text"

export const BlockTodoList = (
  block: GetBlockResponse,
  handler: BlockHandler
) => {
  /* @ts-ignore */
  const todo = block.to_do;
  const text = todo.text;

  const markup = ReactDOMServer.renderToStaticMarkup(
    <ul id={block.id} className={`to-do-list${styleWithColors(todo.color)}`}>
      {text.map((t: GetBlockResponse) => {
        /* @ts-ignore */
        const annotations = t.annotations;
        /* @ts-ignore */
        return (
          <li>
            <div
              /* @ts-ignore */
              className={`checkbox checkbox-${t.checked ? 'on' : 'off'}`}
            ></div>
            {/* @ts-ignore */}
            {HandleBlockAnnotations(annotations, t.text)}
          </li>
        );
      })}
    </ul>
  );
  if (handler.settings?.isTextOnlyBack) {
    return convert(markup);
  }
  return markup;
};
