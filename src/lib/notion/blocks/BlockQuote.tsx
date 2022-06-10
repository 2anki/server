import { GetBlockResponse } from '@notionhq/client/build/src/api-endpoints';
import ReactDOMServer from 'react-dom/server';
import BlockHandler from '../BlockHandler';
import getPlainText from '../helpers/getPlainText';
import { styleWithColors } from '../NotionColors';
import HandleBlockAnnotations from './HandleBlockAnnotations';

export const BlockQuote = (block: GetBlockResponse, handler: BlockHandler) => {
  /* @ts-ignore */
  const { quote } = block;
  const { text } = quote;

  if (handler.settings?.isTextOnlyBack) {
    return getPlainText(text);
  }

  return ReactDOMServer.renderToStaticMarkup(
    <blockquote className={styleWithColors(quote.color)} id={block.id}>
      {text.map((t: GetBlockResponse) => {
        /* @ts-ignore */
        const { annotations } = t;
        /* @ts-ignore */
        return HandleBlockAnnotations(annotations, t.text);
      })}
    </blockquote>
  );
};
