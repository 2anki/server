"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const checkFlashcardsLimits_1 = require("./checkFlashcardsLimits");
describe('checkLimits', () => {
    test('throws an error if more than 100 cards are added for anon', () => {
        expect(() => (0, checkFlashcardsLimits_1.checkFlashcardsLimits)({
            decks: [],
            paying: false,
            cards: 101,
        })).toThrow();
    });
    test('does not throw an error if 100 cards are added by patreon or subscriber', () => {
        expect(() => (0, checkFlashcardsLimits_1.checkFlashcardsLimits)({
            decks: [],
            paying: true,
            cards: 200,
        })).not.toThrow();
        expect(() => (0, checkFlashcardsLimits_1.checkFlashcardsLimits)({
            decks: [],
            cards: 500,
            paying: true,
        })).not.toThrow();
    });
    test('does not throw an error if 51 cards are added by anon', () => {
        expect(() => (0, checkFlashcardsLimits_1.checkFlashcardsLimits)({
            decks: [],
            paying: undefined,
            cards: 51,
        })).not.toThrow();
    });
});
//# sourceMappingURL=checkLimits.test.js.map