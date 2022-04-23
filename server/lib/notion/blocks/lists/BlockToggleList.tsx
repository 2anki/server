import { GetBlockResponse } from '@notionhq/client/build/src/api-endpoints';
import ReactDOMServer from 'react-dom/server';
import { convert } from 'html-to-text';

import BlockHandler from '../../BlockHandler';
import { styleWithColors } from '../../NotionColors';
import renderTextChildren from '../../helpers/renderTextChildren';
import getChildren from '../../helpers/getChildren';

export async function BlockToggleList(
  block: GetBlockResponse,
  handler: BlockHandler
) {
  /* @ts-ignore */
  const list = block.toggle;
  const text = list.text;
  const backSide = await getChildren(block, handler);
  /**
   * We can't just set open to false that won't work since it's a boolean and will be truthy.
   * The open attribute has to be omitted.
   */
  /* @ts-ignore */
  const Details = ({ children }) =>
    handler.settings?.toggleMode === 'open_toggle' ? (
      <details open>{children}</details>
    ) : (
      <details>{children}</details>
    );

  const markup = ReactDOMServer.renderToStaticMarkup(
    <>
      <ul id={block.id} className={`toggle${styleWithColors(list.color)}`}>
        <li>
          <Details>
            <summary
              dangerouslySetInnerHTML={{ __html: renderTextChildren(text, handler.settings) }}
            ></summary>
            <div dangerouslySetInnerHTML={{ __html: backSide }} />
          </Details>
        </li>
      </ul>
    </>
  );

  if (handler.settings?.isTextOnlyBack) {
    return convert(markup);
  }

  return markup;
}
