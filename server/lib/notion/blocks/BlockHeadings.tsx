import { GetBlockResponse } from '@notionhq/client/build/src/api-endpoints';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import TagRegistry from '../../parser/TagRegistry';
import BlockHandler from '../BlockHandler';
import getPlainText from '../helpers/getPlainText';
import { styleWithColors } from '../NotionColors';
import HandleBlockAnnotations from './HandleBlockAnnotations';

interface HeadingProps {
  id: string;
  level: string;
  className: string;
  children: React.ReactNode
}

const Heading = (props: HeadingProps) => {
  const {
    id, level, children, className,
  } = props;
  switch (level) {
    case 'heading_3':
      return <h3 id={id} className={className}>{children}</h3>;
    case 'heading_2':
      return <h2 id={id} className={className}>{children}</h2>;
    default:
      return <h1 id={id} className={className}>{children}</h1>;
  }
};

export const BlockHeading = async (
  level: string,
  block: GetBlockResponse,
  handler: BlockHandler,
) => {
  /* @ts-ignore */
  const heading = block[level];
  const { text } = heading;

  if (handler.settings?.isTextOnlyBack) {
    return getPlainText(text);
  }

  return ReactDOMServer.renderToStaticMarkup(
    <Heading level={level} className={styleWithColors(heading.color)} id={block.id}>
      {text.map((t: GetBlockResponse) => {
        /* @ts-ignore */
        TagRegistry.getInstance().addHeading(t.plain_text);
        /* @ts-ignore */
        const { annotations } = t;
        /* @ts-ignore */
        return HandleBlockAnnotations(annotations, t.text);
      })}
    </Heading>,
  );
};
