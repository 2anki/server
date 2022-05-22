import ReactDOMServer from 'react-dom/server';
import { convert } from 'html-to-text';

import { GetBlockResponse } from '@notionhq/client/build/src/api-endpoints';
import useMetadata from './hooks/useMetadata';
import BlockHandler from '../../../BlockHandler';

const BlockBookmark = async (
  block: GetBlockResponse,
  handler: BlockHandler
): Promise<string | null> => {
  /* @ts-ignore */
  const { bookmark } = block;
  const metadata = await useMetadata(bookmark.url);

  if (handler.settings?.isTextOnlyBack && bookmark) {
    return `${bookmark.title} ${bookmark.url}`;
  }

  const markup = ReactDOMServer.renderToStaticMarkup(
    <a
      style={{ margin: '4px' }}
      href={bookmark.url}
      className="bookmark source"
    >
      <div className="bookmark-info">
        <div className="bookmark-text">
          {metadata.title && (
            <div className="bookmark-title">{metadata.title}</div>
          )}
          {metadata.description && (
            <div className="bookmark-description">{metadata.description}</div>
          )}
        </div>
        <div className="bookmark-href">
          {metadata.logo && (
            <img src={metadata.logo} className="icon bookmark-icon" />
          )}
          {bookmark.url}
        </div>
      </div>
      {metadata.image && (
        <img src={metadata.image} className="bookmark-image" />
      )}
    </a>
  );

  if (handler.settings?.isTextOnlyBack) {
    return convert(markup);
  }

  return markup;
};

export default BlockBookmark;
