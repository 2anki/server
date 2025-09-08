"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImageUrl = void 0;
const client_1 = require("@notionhq/client");
const getImageUrl = (block) => {
    if (!(0, client_1.isFullBlock)(block)) {
        return null;
    }
    switch (block.image.type) {
        case 'external':
            return block.image.external.url;
        case 'file':
            return block.image.file.url;
        default:
            return 'unsupported image: ' + JSON.stringify(block);
    }
};
exports.getImageUrl = getImageUrl;
//# sourceMappingURL=getImageUrl.js.map