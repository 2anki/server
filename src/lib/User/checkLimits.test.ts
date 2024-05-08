import { checkLimits } from './checkLimits';

describe('checkLimits', () => {

  test('throws an error if more than 100 cards are added for anon', () => {
    expect(() => checkLimits({
      decks: [],
      isPatreon: false,
      isSubscriber: false,
      cards: 101
    })).toThrowError('You can only add 100 cards');
  });

  test('does not throw an error if 100 cards are added by patreon or subscriber', () => {
    expect(() => checkLimits({
      decks: [],
      isPatreon: true,
      isSubscriber: false,
      cards: 200
    })).not.toThrow();
    expect(() => checkLimits({
      decks: [],
      isSubscriber: true,
      cards: 500
    })).not.toThrow();
  })
});
