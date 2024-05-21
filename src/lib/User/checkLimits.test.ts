import { checkFlashcardsLimits } from './checkFlashcardsLimits';

describe('checkLimits', () => {

  test('throws an error if more than 100 cards are added for anon', () => {
    expect(() => checkFlashcardsLimits({
      decks: [],
      paying: false,
      cards: 101
    })).toThrow();
  });

  test('does not throw an error if 100 cards are added by patreon or subscriber', () => {
    expect(() => checkFlashcardsLimits({
      decks: [],
      paying: true,
      cards: 200
    })).not.toThrow();
    expect(() => checkFlashcardsLimits({
      decks: [],
      cards: 500
    })).not.toThrow();
  })
});
