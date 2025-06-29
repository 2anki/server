import { isClozeFlashcard } from './types';
import {
  testCases,
  runPlainTextParserTest,
  assertClozeCard,
  assertBasicCard,
} from '../testHelpers';

describe('PlainTextParser', () => {
  describe('parse', () => {
    it('should correctly identify cloze deletion with backticks and = separator', () => {
      runPlainTextParserTest(
        testCases.clozeWithBackticksAndEquals,
        (card) => assertClozeCard(card, testCases.clozeWithBackticksAndEquals.expected.clozeContent)
      );
    });

    it('should correctly identify cloze deletion with underscores and - separator', () => {
      runPlainTextParserTest(
        testCases.clozeWithUnderscoresAndDash,
        (card) => assertClozeCard(card, testCases.clozeWithUnderscoresAndDash.expected.clozeContent)
      );
    });

    it('should correctly handle basic flashcards with - separator', () => {
      runPlainTextParserTest(
        testCases.basicWithDash,
        (card) => assertBasicCard(
          card,
          testCases.basicWithDash.expected.front,
          testCases.basicWithDash.expected.back
        )
      );
    });

    it('should correctly handle basic flashcards with = separator', () => {
      runPlainTextParserTest(
        testCases.basicWithEquals,
        (card) => assertBasicCard(
          card,
          testCases.basicWithEquals.expected.front,
          testCases.basicWithEquals.expected.back
        )
      );
    });
  });
});
