import {
  GetBlockResponse,
  TextRichTextItemResponse,
} from '@notionhq/client/build/src/api-endpoints';

import Note from '../../../lib/parser/Note';
import { getRichTextFromBlock } from './getRichTextFromBlock';
import isColumnList from './isColumnList';

// The user wants to turn code blocks into cloze deletions <code>word</code> becomes {{c1::word}}
// This all should be tested with Jest
export default function getClozeDeletionCard(
  block: GetBlockResponse
): Note | undefined {
  let isCloze = false;
  let name = '';
  let index = 1;

  const richText = getRichTextFromBlock(block);
  if (!richText || isColumnList(block)) {
    return undefined;
  }
  for (const cb of richText) {
    const text = (cb as TextRichTextItemResponse).text;
    if (cb.annotations.code) {
      if (text?.content.includes('::')) {
        if (text?.content.match(/[cC]\d+::/)) {
          name += `{{${text?.content}}}`;
        } else {
          const clozeIndex = `{{c${index}::`;
          if (!name.includes(clozeIndex)) {
            name += `{{c${index}::${text?.content}}}`;
          }
        }
      } else {
        name += `{{c${index}::${text?.content}}}`;
      }
      name = name.replace('{{{{', '{{').replace('}}}}', '}}');
      isCloze = true;
      index++;
    } else if (text?.content) {
      // Convert newlines to <br /> tags for proper HTML rendering
      // XXX: This a potential regression since the preserve newline card option is not checked.
      const contentWithBr = text.content.replaceAll('\n', '<br />');
      name += contentWithBr;
    }
  }
  if (isCloze) {
    const note = new Note(name, '');
    note.cloze = isCloze;
    return note;
  }
  return undefined;
}
