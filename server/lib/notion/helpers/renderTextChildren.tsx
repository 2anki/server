import { GetBlockResponse } from '@notionhq/client/build/src/api-endpoints';
import ReactDOMServer from 'react-dom/server';
import Settings from '../../parser/Settings';

import BlockEquation from '../blocks/BlockEquation';
import HandleBlockAnnotations from '../blocks/HandleBlockAnnotations';
import isEquation from './isEquation';
import isText from './isText';
import preserveNewlinesIfApplicable from './preserveNewlinesIfApplicable';

export default function renderTextChildren(
  text: any[],
  settings: Settings
): string {
  if (text.length === 0) {
    return '';
  }
  const content = text
    .map((t: GetBlockResponse) => {
      /* @ts-ignore */
      if (isEquation(t)) {
        return BlockEquation(t);
      }

      /* @ts-ignore */
      if (isText(t)) {
        /* @ts-ignore */
        const annotations = t.annotations;
        return ReactDOMServer.renderToStaticMarkup(
          /* @ts-ignore */
          <>{HandleBlockAnnotations(annotations, t.text)}</>
        );
      }

      /* @ts-ignore */
      return `unsupported type: ${t.type}\n${JSON.stringify(t, null, 2)}`;
    })
    .reduce((acc, curr) => acc + curr);
  return preserveNewlinesIfApplicable(content, settings);
}
