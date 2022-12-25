import {
  EquationRichTextItemResponse,
  RichTextItemResponse,
  TextRichTextItemResponse,
} from '@notionhq/client/build/src/api-endpoints';
import ReactDOMServer from 'react-dom/server';
import Settings from '../../parser/Settings';

import BlockEquation from '../blocks/BlockEquation';
import HandleBlockAnnotations from '../blocks/HandleBlockAnnotations';
import isEquation from './isEquation';
import isText from './isText';
import preserveNewlinesIfApplicable from './preserveNewlinesIfApplicable';

export default function renderTextChildren(
  text: RichTextItemResponse[],
  settings: Settings
): string {
  if (text.length === 0) {
    return '';
  }
  const content = text
    .map((t: RichTextItemResponse) => {
      if (isEquation(t)) {
        return BlockEquation(t as EquationRichTextItemResponse);
      }

      if (isText(t)) {
        const { annotations } = t;
        return ReactDOMServer.renderToStaticMarkup(
          <>
            {HandleBlockAnnotations(
              annotations,
              (t as TextRichTextItemResponse).text
            )}
          </>
        );
      }

      return `unsupported type: ${t.type}\n${JSON.stringify(t, null, 2)}`;
    })
    .reduce((acc, curr) => acc + curr);
  return preserveNewlinesIfApplicable(content, settings);
}
