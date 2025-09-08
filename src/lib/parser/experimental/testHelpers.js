"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertBulletPoints = exports.assertBasicCard = exports.assertClozeCard = exports.runFallbackParserTest = exports.runPlainTextParserTest = exports.testCases = void 0;
const PlainTextParser_1 = require("./PlainTextParser/PlainTextParser");
const FallbackParser_1 = __importDefault(require("./FallbackParser"));
const types_1 = require("./PlainTextParser/types");
// Common test data
exports.testCases = {
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
const runPlainTextParserTest = (testCase, assertion) => {
    const parser = new PlainTextParser_1.PlainTextParser();
    const result = parser.parse(testCase.input);
    expect(result.length).toBe(1);
    assertion(result[0]);
};
exports.runPlainTextParserTest = runPlainTextParserTest;
// Helper functions for FallbackParser tests
const runFallbackParserTest = (testCase, assertion) => {
    const parser = new FallbackParser_1.default([]);
    const result = parser.getMarkdownBulletLists(testCase.input);
    assertion(result);
};
exports.runFallbackParserTest = runFallbackParserTest;
// Common assertions
const assertClozeCard = (card, expectedContent) => {
    expect((0, types_1.isClozeFlashcard)(card)).toBe(true);
    if ((0, types_1.isClozeFlashcard)(card)) {
        expect(card.front).toContain(`{{c1::${expectedContent}}}`);
    }
};
exports.assertClozeCard = assertClozeCard;
const assertBasicCard = (card, expectedFront, expectedBack) => {
    expect((0, types_1.isClozeFlashcard)(card)).toBe(false);
    if (!(0, types_1.isClozeFlashcard)(card)) {
        expect(card.front).toBe(expectedFront);
        expect(card.back).toBe(expectedBack);
    }
};
exports.assertBasicCard = assertBasicCard;
const assertBulletPoints = (result, expected) => {
    expect(result).toEqual([expected]);
};
exports.assertBulletPoints = assertBulletPoints;
//# sourceMappingURL=testHelpers.js.map