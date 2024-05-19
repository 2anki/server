import Deck from './Deck';
import { getTitleFromMarkdown } from './getTitleFromMarkdown';
import get16DigitRandomId from '../../shared/helpers/get16DigitRandomId';
import Note from './Note';
import { markdownToHTML } from '../markdown';

import Settings from './Settings';

const BULLET_POINT_REGEX = /^-/;

export const handleNestedBulletPointsInMarkdown = (
  name: string,
  contents: string | undefined,
  deckName: string | undefined,
  decks: Deck[],
  settings: Settings
) => {
  const deck = new Deck(
    deckName ?? getTitleFromMarkdown(contents) ?? name,
    [],
    '',
    '',
    get16DigitRandomId(),
    settings
  );

  decks.push(deck);

  // Parse the markdown content
  const lines = contents?.split('\n') ?? [];
  let isCreating = false;
  let currentFront = '';
  let currentBack = '';

  for (const line of lines) {
    if (line.trim().length === 0) {
      continue;
    }

    const isEnd = lines.length - 1 == lines.indexOf(line);
    if (isEnd || (BULLET_POINT_REGEX.exec(line) && isCreating)) {
      deck.cards.push(new Note(currentFront, markdownToHTML(currentBack)));
      isCreating = false;
      currentFront = '';
      currentBack = '';
    }

    if (BULLET_POINT_REGEX.exec(line) && !isCreating) {
      isCreating = true;
      currentFront = markdownToHTML(line);
      currentBack = '';
    } else if (isCreating) {
      currentBack += line + '\n';
    }
  }

  if (currentBack !== '' || currentFront !== '') {
    deck.cards.push(new Note(currentFront, markdownToHTML(currentBack)));
  }

  return decks;
};
