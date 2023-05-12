import { ParagraphBlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import ReactDOMServer from 'react-dom/server';
import { convert } from 'html-to-text';
import BlockHandler from '../BlockHandler/BlockHandler';
import { styleWithColors } from '../NotionColors';

import renderTextChildren from '../helpers/renderTextChildren';

const BlockParagraph = (
  block: ParagraphBlockObjectResponse,
  handler: BlockHandler
): string | null => {
  const { paragraph } = block;
  const { rich_text: richText } = paragraph;

  const markup = ReactDOMServer.renderToStaticMarkup(
    <p
      className={styleWithColors(paragraph.color)}
      id={block.id}
      dangerouslySetInnerHTML={{
        __html: renderTextChildren(richText, handler.settings),
      }}
    ></p>
  );

  if (handler.settings?.isTextOnlyBack) {
    return convert(markup);
  }

  return markup;
};

export default BlockParagraph;
