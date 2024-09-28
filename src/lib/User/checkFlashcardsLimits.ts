import Deck from '../parser/Deck';
import { getLimitMessage } from '../misc/getLimitMessage';

interface UserOptions {
  paying?: boolean;
  cards?: number;
  decks?: Deck[];
}

const getCardCount = (initial: number, decks?: Deck[]) => {
  if (decks === undefined) return initial ?? 0;

  return decks.reduce((acc, deck) => acc + deck.cards.length, initial);
};

export const checkFlashcardsLimits = ({
  cards,
  decks,
  paying,
}: UserOptions) => {
  const CARD_LIMIT = 100;
  const cardCount = getCardCount(cards ?? 0, decks);
  const isAbove100 = cardCount > CARD_LIMIT;

  if (paying) return;

  if (isAbove100) {
    throw new Error(getLimitMessage());
  }
};
