"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toText = void 0;
const toText = (input) => input.replace(/<[^>]*>?/gm, '');
exports.toText = toText;
//# sourceMappingURL=deckNameToText.js.map