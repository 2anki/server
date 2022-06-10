import { GetBlockResponse } from '@notionhq/client/build/src/api-endpoints';

import ParserRules from '../../parser/ParserRules';
import Note from '../../parser/Note';
import isColumnList from './isColumnList';

// The user wants to turn under lines into input cards <strong>keyword</strong> becomes {{type::word}}
export default async function getInputCard(
  rules: ParserRules,
  block: GetBlockResponse
): Promise<Note | undefined> {
  let isInput = false;
  let name = '';
  let answer = '';
  const flashCardTypes = rules.flaschardTypeNames();
  for (const FLASHCARD of flashCardTypes) {
    // @ts-ignore
    const flashcardBlock = block[FLASHCARD];
    // @ts-ignore
    if (!flashcardBlock || isColumnList(block)) {
      continue;
    }
    for (const cb of flashcardBlock.text) {
      if (cb.annotations.underline || cb.annotations.bold) {
        answer += cb.text.content;
        isInput = true;
      } else {
        name += cb.text.content;
      }
    }
  }
  if (isInput) {
    const note = new Note(name, '');
    note.enableInput = isInput;
    note.answer = answer;
    return note;
  }
  return undefined;
}
