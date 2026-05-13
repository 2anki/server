import type Deck from '../parser/Deck';
import { getLimitMessage } from '../misc/getLimitMessage';
import { hasUnlimitedAccess, type TrialUser } from './trialAccess';

interface UserOptions {
  paying?: boolean;
  trial?: TrialUser | null;
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
  trial,
}: UserOptions) => {
  const CARD_LIMIT = 100;
  const cardCount = getCardCount(cards ?? 0, decks);
  const isAbove100 = cardCount > CARD_LIMIT;

  if (paying || hasUnlimitedAccess(trial)) return;

  if (isAbove100) {
    throw new Error(getLimitMessage());
  }
};
