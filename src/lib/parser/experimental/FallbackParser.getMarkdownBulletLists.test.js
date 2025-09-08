"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testHelpers_1 = require("./testHelpers");
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
        (0, testHelpers_1.runFallbackParserTest)(fallbackTestCases.basicBulletWithDash, (result) => expect(result).toEqual(fallbackTestCases.basicBulletWithDash.expected));
    });
    it('should extract basic bullet points with * character', () => {
        (0, testHelpers_1.runFallbackParserTest)(fallbackTestCases.basicBulletWithAsterisk, (result) => expect(result).toEqual(fallbackTestCases.basicBulletWithAsterisk.expected));
    });
    it('should extract basic bullet points with + character', () => {
        (0, testHelpers_1.runFallbackParserTest)(fallbackTestCases.basicBulletWithPlus, (result) => expect(result).toEqual(fallbackTestCases.basicBulletWithPlus.expected));
    });
    it('should extract bullet points with cloze deletion format using backticks and = separator', () => {
        (0, testHelpers_1.runFallbackParserTest)(testHelpers_1.testCases.clozeWithBackticksAndEquals, (result) => (0, testHelpers_1.assertBulletPoints)(result, testHelpers_1.testCases.clozeWithBackticksAndEquals.expected.bulletPoint));
    });
    it('should extract bullet points with cloze deletion format using underscores and - separator', () => {
        (0, testHelpers_1.runFallbackParserTest)(testHelpers_1.testCases.clozeWithUnderscoresAndDash, (result) => (0, testHelpers_1.assertBulletPoints)(result, testHelpers_1.testCases.clozeWithUnderscoresAndDash.expected.bulletPoint));
    });
    it('should extract bullet points with multiple spaces after the bullet character', () => {
        (0, testHelpers_1.runFallbackParserTest)(fallbackTestCases.bulletWithMultipleSpaces, (result) => expect(result).toEqual(fallbackTestCases.bulletWithMultipleSpaces.expected));
    });
    it('should handle bullet points with minimal content', () => {
        (0, testHelpers_1.runFallbackParserTest)(fallbackTestCases.bulletWithMinimalContent, (result) => expect(result).toEqual(fallbackTestCases.bulletWithMinimalContent.expected));
    });
    it('should handle bullet points within other text', () => {
        (0, testHelpers_1.runFallbackParserTest)(fallbackTestCases.bulletWithinOtherText, (result) => expect(result).toEqual(fallbackTestCases.bulletWithinOtherText.expected));
    });
});
//# sourceMappingURL=FallbackParser.getMarkdownBulletLists.test.js.map