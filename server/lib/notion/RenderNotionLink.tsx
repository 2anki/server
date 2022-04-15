import ReactDOMServer from 'react-dom/server';
import BlockHandler from './BlockHandler';

const RenderNotionLink = (
  link: string,
  handler: BlockHandler
): string | null => {
  if (handler.settings?.isTextOnlyBack) {
    return link;
  }
  return ReactDOMServer.renderToStaticMarkup(
    <div style={{ textAlign: 'center' }}>
      <a style={{ textDecoration: 'none', color: 'grey' }} href={link}>
        Open in Notion
      </a>
    </div>
  );
};

export default RenderNotionLink;
