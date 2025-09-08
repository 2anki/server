"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.richObjectToString = void 0;
const richObjectToString = (block) => {
    return block.rich_text.map((t) => t.plain_text).join('');
};
exports.richObjectToString = richObjectToString;
//# sourceMappingURL=richObjectToString.js.map