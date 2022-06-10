import { GetBlockResponse } from '@notionhq/client/build/src/api-endpoints';
import ReactDOMServer from 'react-dom/server';
import { convert } from 'html-to-text';
import BlockHandler from '../BlockHandler';
import { styleWithColors } from '../NotionColors';

import renderTextChildren from '../helpers/renderTextChildren';

const BlockParagraph = async (
  block: GetBlockResponse,
  handler: BlockHandler
): Promise<string | null> => {
  /* @ts-ignore */
  const { paragraph } = block;
  const { text } = paragraph;

  const markup = ReactDOMServer.renderToStaticMarkup(
    <p
      className={styleWithColors(paragraph.color)}
      id={block.id}
      dangerouslySetInnerHTML={{
        __html: renderTextChildren(text, handler.settings),
      }}
    ></p>
  );

  if (handler.settings?.isTextOnlyBack) {
    return convert(markup);
  }

  return markup;
};

export default BlockParagraph;
