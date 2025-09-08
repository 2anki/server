"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileUrl = void 0;
const client_1 = require("@notionhq/client");
const getFileUrl = (block) => {
    if (!(0, client_1.isFullBlock)(block)) {
        return null;
    }
    switch (block.file.type) {
        case 'external':
            return block.file.external.url;
        case 'file':
            return block.file.file.url;
        default:
            return 'unsupported file: ' + JSON.stringify(block);
    }
};
exports.getFileUrl = getFileUrl;
//# sourceMappingURL=getFileUrl.js.map