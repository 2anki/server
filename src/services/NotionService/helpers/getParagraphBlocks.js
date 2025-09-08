"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParagraphBlocks = void 0;
const client_1 = require("@notionhq/client");
const getParagraphBlocks = (results) => results.filter((block) => {
    if (!(0, client_1.isFullBlock)(block)) {
        return false;
    }
    return block.type === 'paragraph';
});
exports.getParagraphBlocks = getParagraphBlocks;
//# sourceMappingURL=getParagraphBlocks.js.map