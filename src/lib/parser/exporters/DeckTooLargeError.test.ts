import { DeckTooLargeError } from './DeckTooLargeError';

describe('DeckTooLargeError', () => {
  it('is an Error subclass named DeckTooLargeError', () => {
    const error = new DeckTooLargeError();

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(DeckTooLargeError);
    expect(error.name).toBe('DeckTooLargeError');
  });

  it('survives an instanceof check after throw/catch', () => {
    let caught: unknown;
    try {
      throw new DeckTooLargeError();
    } catch (err) {
      caught = err;
    }

    expect(caught).toBeInstanceOf(DeckTooLargeError);
  });
});
