"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deckNameToText_1 = require("./deckNameToText");
test('removes html tags from deck name', () => {
    expect((0, deckNameToText_1.toText)('<span class=icon>😺</span>HTML test::innerText')).toBe('😺HTML test::innerText');
});
//# sourceMappingURL=deckNameToText.test.js.map