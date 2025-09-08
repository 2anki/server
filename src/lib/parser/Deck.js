"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Deck {
    get cardCount() {
        return this.cards.length;
    }
    constructor(name, cards, image, style, id, settings) {
        this.settings = settings;
        this.name = name.replace(/\n/g, ' ');
        this.cards = cards;
        this.image = image;
        this.style = style;
        this.id = id;
        console.log(`New Deck with ${this.cards.length} cards`);
    }
    static CleanCards(cards) {
        return cards.filter((note) => note.isValidClozeNote() ||
            note.isValidInputNote() ||
            note.isValidBasicNote());
    }
    cleanStyle() {
        if (this.style) {
            return this.style.replace(/'/g, '"');
        }
        return '';
    }
}
exports.default = Deck;
//# sourceMappingURL=Deck.js.map