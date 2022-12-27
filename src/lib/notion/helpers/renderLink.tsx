import { GetBlockResponse } from '@notionhq/client/build/src/api-endpoints';
import ReactDOMServer from 'react-dom/server';
import renderIcon from './renderIcon';

export default function renderLink(
  title: string,
  block: GetBlockResponse,
  icon?: string
) {
  return ReactDOMServer.renderToStaticMarkup(
    <a id={block.id} href={`https://notion.so/${block.id.replace(/\-/g, '')}`}>
      {renderIcon(icon)}
      {title}
    </a>
  );
}
