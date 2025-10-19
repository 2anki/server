import {
  EquationRichTextItemResponse,
  RichTextItemResponse,
} from '@notionhq/client/build/src/api-endpoints';
import ReactDOMServer from 'react-dom/server';
import CardOption from '../../../lib/parser/Settings';

import BlockEquation from '../blocks/BlockEquation';
import HandleBlockAnnotations from '../blocks/HandleBlockAnnotations';
import isEquation from './isEquation';
import isText from './isText';
import preserveNewlinesIfApplicable from './preserveNewlinesIfApplicable';

export default function renderTextChildren(
  text: RichTextItemResponse[] | undefined,
  settings: CardOption
): string {
  if (!text || text?.length === 0) {
    return '';
  }
  const content = text
    .map((t: RichTextItemResponse) => {
      if (isEquation(t)) {
        return BlockEquation(t as EquationRichTextItemResponse);
      }

      if (isText(t)) {
        // Always pass all annotation properties, including color
        const { annotations } = t;
        const fullAnnotations = { ...annotations, color: t.annotations.color };
        return ReactDOMServer.renderToStaticMarkup(
          <>{HandleBlockAnnotations(fullAnnotations, t)}</>
        );
      }

      return `unsupported type: ${t.type}\n${JSON.stringify(t, null, 2)}`;
    })
    .reduce((acc, curr) => acc + curr);
  return preserveNewlinesIfApplicable(content, settings);
}
