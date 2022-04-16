import { GetBlockResponse } from '@notionhq/client/build/src/api-endpoints';

import ParserRules from '../../parser/ParserRules';
import Note from '../../parser/Note';
import isColumnList from './isColumnList';

// The user wants to turn code blocks into cloze deletions <code>word</code> becomes {{c1::word}}
// This all should be tested with Jest
export default async function getClozeDeletionCard(
  rules: ParserRules,
  block: GetBlockResponse
): Promise<Note | undefined> {
  let isCloze = false;
  let name = '';
  let index = 1;
  const flashCardTypes = rules.flaschardTypeNames();
  for (const FLASHCARD of flashCardTypes) {
    // @ts-ignore
    const flashcardBlock = block[FLASHCARD];
    // @ts-ignore
    if (!flashcardBlock || isColumnList(block)) {
      continue;
    }
    for (const cb of flashcardBlock.text) {
      if (cb.annotations.code) {
        const content = cb.text.content;
        if (content.includes('::')) {
          if (content.match(/[cC]\d+::/)) {
            name += `{{${content}}}`;
          } else {
            const clozeIndex = '{{c' + index + '::';
            if (!name.includes(clozeIndex)) {
              name += `{{c${index}::${content}}}`;
            }
          }
        } else {
          name += `{{c${index}::${content}}}`;
        }
        name = name.replace('{{{{', '{{').replace('}}}}', '}}');
        isCloze = true;
        index++;
      } else if (cb.text?.content){
        name += cb.text.content;
      }
    }
  }
  if (isCloze) {
    const note = new Note(name, '');
    note.cloze = isCloze;
    return note;
  }
  return undefined;
}
