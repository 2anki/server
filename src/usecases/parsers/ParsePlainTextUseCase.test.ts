import { PlainTextParser } from '../../lib/parser/experimental/PlainTextParser/PlainTextParser';
import { ParsePlainTextUseCase } from './ParsePlainTextUseCase';

describe('Parse plaintext use case', () => {
  it('should find one cloze flashcard', () => {
    const input = 'The capital of __ is Paris. - France';
    expect(
      new ParsePlainTextUseCase(new PlainTextParser()).execute(input)
    ).toEqual([
      { front: 'The capital of {{c1::France}} is Paris.', isCloze: true },
    ]);
  });

  it('should find two cloze flashcards', () => {
    const input =
      'There tends to be a lot of ice on ____ & ____. - bridges, overpasses';
    expect(
      new ParsePlainTextUseCase(new PlainTextParser()).execute(input)
    ).toEqual([
      {
        front:
          'There tends to be a lot of ice on {{c1::bridges}} & {{c2::overpasses}}.',
        isCloze: true,
      },
    ]);
  });

  it('should find basic blashcard', () => {
    const input = 'What is the capital of France? - Paris';
    expect(
      new ParsePlainTextUseCase(new PlainTextParser()).execute(input)
    ).toEqual([
      {
        front: 'What is the capital of France?',
        back: 'Paris',
      },
    ]);
  });
});
