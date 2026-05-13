import { checkFlashcardsLimits } from './checkFlashcardsLimits';

describe('checkLimits', () => {
  test('throws an error if more than 300 cards are added for anon', () => {
    expect(() =>
      checkFlashcardsLimits({
        decks: [],
        paying: false,
        cards: 301,
      })
    ).toThrow();
  });

  test('does not throw an error when paying user exceeds 300 cards', () => {
    expect(() =>
      checkFlashcardsLimits({
        decks: [],
        paying: true,
        cards: 500,
      })
    ).not.toThrow();
    expect(() =>
      checkFlashcardsLimits({
        decks: [],
        cards: 1000,
        paying: true,
      })
    ).not.toThrow();
  });

  test('does not throw an error if 300 cards are added by anon', () => {
    expect(() =>
      checkFlashcardsLimits({
        decks: [],
        paying: undefined,
        cards: 300,
      })
    ).not.toThrow();
  });
});
