import Deck from '../parser/Deck';
import { getLimitMessage } from '../misc/getLimitMessage';

interface UserOptions {
  paying?: boolean;
  cards?: number;
  decks?: Deck[];
}

const getCardCount = (initial: number, decks?: Deck[]) => {
  let start = initial ?? 0;

  if (decks === undefined) return start;

  return decks.reduce((acc, deck) => acc + deck.cards.length, initial) + start;
};

export const checkFlashcardsLimits = ({
  cards,
  decks,
  paying,
}: UserOptions) => {
  const CARD_LIMIT = 100;
  const isAbove100 = getCardCount(cards ?? 0, decks) > CARD_LIMIT;

  if (paying) return;

  if (isAbove100) {
    throw new Error(getLimitMessage());
  }
};
