import {
  testCases,
  runFallbackParserTest,
  assertBulletPoints,
} from './testHelpers';

describe('FallbackParser.getMarkdownBulletLists', () => {
  // Define additional test cases specific to FallbackParser
  const fallbackTestCases = {
    basicBulletWithDash: {
      input: '- Item 1\n- Item 2\n- Item 3',
      expected: ['- Item 1', '- Item 2', '- Item 3'],
    },
    basicBulletWithAsterisk: {
      input: '* Item 1\n* Item 2\n* Item 3',
      expected: ['* Item 1', '* Item 2', '* Item 3'],
    },
    basicBulletWithPlus: {
      input: '+ Item 1\n+ Item 2\n+ Item 3',
      expected: ['+ Item 1', '+ Item 2', '+ Item 3'],
    },
    bulletWithMultipleSpaces: {
      input: '-  Item with two spaces\n-   Item with three spaces',
      expected: ['-  Item with two spaces', '-   Item with three spaces'],
    },
    bulletWithMinimalContent: {
      input: '- A\n- Item 2',
      expected: ['- A', '- Item 2'],
    },
    bulletWithinOtherText: {
      input: 'Some text before\n- Item 1\n- Item 2\nSome text after',
      expected: ['- Item 1', '- Item 2'],
    },
  };

  it('should extract basic bullet points with - character', () => {
    runFallbackParserTest(fallbackTestCases.basicBulletWithDash, (result) =>
      expect(result).toEqual(fallbackTestCases.basicBulletWithDash.expected)
    );
  });

  it('should extract basic bullet points with * character', () => {
    runFallbackParserTest(fallbackTestCases.basicBulletWithAsterisk, (result) =>
      expect(result).toEqual(fallbackTestCases.basicBulletWithAsterisk.expected)
    );
  });

  it('should extract basic bullet points with + character', () => {
    runFallbackParserTest(fallbackTestCases.basicBulletWithPlus, (result) =>
      expect(result).toEqual(fallbackTestCases.basicBulletWithPlus.expected)
    );
  });

  it('should extract bullet points with cloze deletion format using backticks and = separator', () => {
    runFallbackParserTest(testCases.clozeWithBackticksAndEquals, (result) =>
      assertBulletPoints(
        result,
        testCases.clozeWithBackticksAndEquals.expected.bulletPoint
      )
    );
  });

  it('should extract bullet points with cloze deletion format using underscores and - separator', () => {
    runFallbackParserTest(testCases.clozeWithUnderscoresAndDash, (result) =>
      assertBulletPoints(
        result,
        testCases.clozeWithUnderscoresAndDash.expected.bulletPoint
      )
    );
  });

  it('should extract bullet points with multiple spaces after the bullet character', () => {
    runFallbackParserTest(
      fallbackTestCases.bulletWithMultipleSpaces,
      (result) =>
        expect(result).toEqual(
          fallbackTestCases.bulletWithMultipleSpaces.expected
        )
    );
  });

  it('should handle bullet points with minimal content', () => {
    runFallbackParserTest(
      fallbackTestCases.bulletWithMinimalContent,
      (result) =>
        expect(result).toEqual(
          fallbackTestCases.bulletWithMinimalContent.expected
        )
    );
  });

  it('should handle bullet points within other text', () => {
    runFallbackParserTest(fallbackTestCases.bulletWithinOtherText, (result) =>
      expect(result).toEqual(fallbackTestCases.bulletWithinOtherText.expected)
    );
  });
});
