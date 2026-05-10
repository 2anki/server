import { EmptyDeckError } from './EmptyDeckError';

describe('EmptyDeckError', () => {
  it('is an Error subclass with the EmptyDeckError name', () => {
    const error = new EmptyDeckError();

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(EmptyDeckError);
    expect(error.name).toBe('EmptyDeckError');
  });

  it('survives an instanceof check after being thrown and caught', () => {
    let caught: unknown;
    try {
      throw new EmptyDeckError();
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(EmptyDeckError);
  });
});
