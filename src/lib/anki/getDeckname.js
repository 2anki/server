"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getDeckName;
/**
 * This will collapse children with exact same title to the parent.
 * This is safe to do because the parent will be the one that is used to create the deck.
 * The user is potentially losing the ability to create a deck with the same name as a parent.
 * In the real world this does not really matter but adding this note in case that assumption
 * changes.
 */
function getDeckName(parent, name) {
    if (parent && parent !== name) {
        return `${parent}::${name}`;
    }
    return name;
}
//# sourceMappingURL=getDeckname.js.map