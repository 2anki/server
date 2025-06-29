import { PlainTextParser } from './PlainTextParser/PlainTextParser';
import FallbackParser from './FallbackParser';
import { isClozeFlashcard } from './PlainTextParser/types';

// Common test data
export const testCases = {
  clozeWithBackticksAndEquals: {
    input: '- hübsch, schön = `bonito`',
    expected: {
      bulletPoint: '- hübsch, schön = `bonito`',
      clozeContent: 'bonito',
    },
  },
  clozeWithUnderscoresAndDash: {
    input: '- hübsch, schön - ___',
    expected: {
      bulletPoint: '- hübsch, schön - ___',
      clozeContent: 'hübsch',
    },
  },
  basicWithDash: {
    input: '- Question - Answer',
    expected: {
      front: '- Question',
      back: 'Answer',
    },
  },
  basicWithEquals: {
    input: '- Question = Answer',
    expected: {
      front: '- Question',
      back: 'Answer',
    },
  },
};

// Helper functions for PlainTextParser tests
export const runPlainTextParserTest = (testCase, assertion) => {
  const parser = new PlainTextParser();
  const result = parser.parse(testCase.input);

  expect(result.length).toBe(1);
  assertion(result[0]);
};

// Helper functions for FallbackParser tests
export const runFallbackParserTest = (testCase, assertion) => {
  const parser = new FallbackParser([]);
  const result = parser.getMarkdownBulletLists(testCase.input);

  assertion(result);
};

// Common assertions
export const assertClozeCard = (card, expectedContent) => {
  expect(isClozeFlashcard(card)).toBe(true);

  if (isClozeFlashcard(card)) {
    expect(card.front).toContain(`{{c1::${expectedContent}}}`);
  }
};

export const assertBasicCard = (card, expectedFront, expectedBack) => {
  expect(isClozeFlashcard(card)).toBe(false);

  if (!isClozeFlashcard(card)) {
    expect(card.front).toBe(expectedFront);
    expect(card.back).toBe(expectedBack);
  }
};

export const assertBulletPoints = (result, expected) => {
  expect(result).toEqual([expected]);
};
