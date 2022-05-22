import { GetBlockResponse } from '@notionhq/client/build/src/api-endpoints';
import ReactDOMServer from 'react-dom/server';
import BlockHandler from '../BlockHandler';
import getPlainText from '../helpers/getPlainText';
import { styleWithColors } from '../NotionColors';
import HandleBlockAnnotations from './HandleBlockAnnotations';

const FrontFlashcard = (block: GetBlockResponse, handler: BlockHandler) => {
  /* @ts-ignore */
  const { text } = block;

  if (handler?.settings?.isTextOnlyBack) {
    return getPlainText(text);
  }
  /* @ts-ignore */
  const style = styleWithColors(block.color);
  return ReactDOMServer.renderToStaticMarkup(
    <div className={style}>
      {text.map((t: GetBlockResponse) => {
        /* @ts-ignore */
        const { annotations } = t;
        /* @ts-ignore */
        return HandleBlockAnnotations(annotations, t.text);
      })}
    </div>
  );
};

export default FrontFlashcard;
