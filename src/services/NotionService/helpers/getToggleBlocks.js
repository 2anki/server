"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getToggleBlocks = void 0;
const client_1 = require("@notionhq/client");
const getToggleBlocks = (results) => results.filter((block) => {
    if (!(0, client_1.isFullBlock)(block)) {
        return false;
    }
    return block.type === 'toggle';
});
exports.getToggleBlocks = getToggleBlocks;
//# sourceMappingURL=getToggleBlocks.js.map