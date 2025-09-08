"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testHelpers_1 = require("../testHelpers");
describe('PlainTextParser', () => {
    describe('parse', () => {
        it('should correctly identify cloze deletion with backticks and = separator', () => {
            (0, testHelpers_1.runPlainTextParserTest)(testHelpers_1.testCases.clozeWithBackticksAndEquals, (card) => (0, testHelpers_1.assertClozeCard)(card, testHelpers_1.testCases.clozeWithBackticksAndEquals.expected.clozeContent));
        });
        it('should correctly identify cloze deletion with underscores and - separator', () => {
            (0, testHelpers_1.runPlainTextParserTest)(testHelpers_1.testCases.clozeWithUnderscoresAndDash, (card) => (0, testHelpers_1.assertClozeCard)(card, testHelpers_1.testCases.clozeWithUnderscoresAndDash.expected.clozeContent));
        });
        it('should correctly handle basic flashcards with - separator', () => {
            (0, testHelpers_1.runPlainTextParserTest)(testHelpers_1.testCases.basicWithDash, (card) => (0, testHelpers_1.assertBasicCard)(card, testHelpers_1.testCases.basicWithDash.expected.front, testHelpers_1.testCases.basicWithDash.expected.back));
        });
        it('should correctly handle basic flashcards with = separator', () => {
            (0, testHelpers_1.runPlainTextParserTest)(testHelpers_1.testCases.basicWithEquals, (card) => (0, testHelpers_1.assertBasicCard)(card, testHelpers_1.testCases.basicWithEquals.expected.front, testHelpers_1.testCases.basicWithEquals.expected.back));
        });
    });
});
//# sourceMappingURL=PlainTextParser.test.js.map