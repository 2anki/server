import { GetBlockResponse } from '@notionhq/client/build/src/api-endpoints';
import ReactDOMServer from 'react-dom/server';

export default function renderLink(
  title: string,
  block: GetBlockResponse,
  icon?: { type: string, emoji: string },
) {
  return ReactDOMServer.renderToStaticMarkup(
    <a id={block.id} href={`https://notion.so/${block.id.replace(/\-/g, '')}`}>
      {icon && icon.type === 'emoji' && (
        <span className="icon">{icon.emoji}</span>
      )}
      {title}
    </a>,
  );
}
