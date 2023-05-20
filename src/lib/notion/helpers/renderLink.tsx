import { GetBlockResponse } from '@notionhq/client/build/src/api-endpoints';
import ReactDOMServer from 'react-dom/server';
import renderIcon from './renderIcon';

export default async function renderLink(
  title: string,
  block: GetBlockResponse,
  icon?: string
) {
  const r = await renderIcon(icon);
  return ReactDOMServer.renderToStaticMarkup(
    <a id={block.id} href={`https://notion.so/${block.id.replace(/-/g, '')}`}>
      {r}
      {title}
    </a>
  );
}
