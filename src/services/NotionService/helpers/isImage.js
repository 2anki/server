"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isImage = void 0;
const isImage = (block) => {
    return block.type === 'image' && 'image' in block;
};
exports.isImage = isImage;
//# sourceMappingURL=isImage.js.map