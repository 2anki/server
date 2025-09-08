"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkFlashcardsLimits = void 0;
const getLimitMessage_1 = require("../misc/getLimitMessage");
const getCardCount = (initial, decks) => {
    if (decks === undefined)
        return initial !== null && initial !== void 0 ? initial : 0;
    return decks.reduce((acc, deck) => acc + deck.cards.length, initial);
};
const checkFlashcardsLimits = ({ cards, decks, paying, }) => {
    const CARD_LIMIT = 100;
    const cardCount = getCardCount(cards !== null && cards !== void 0 ? cards : 0, decks);
    const isAbove100 = cardCount > CARD_LIMIT;
    if (paying)
        return;
    if (isAbove100) {
        throw new Error((0, getLimitMessage_1.getLimitMessage)());
    }
};
exports.checkFlashcardsLimits = checkFlashcardsLimits;
//# sourceMappingURL=checkFlashcardsLimits.js.map