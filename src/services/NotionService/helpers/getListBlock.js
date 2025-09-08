"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getListBlock = getListBlock;
const client_1 = require("@notionhq/client");
function getListBlock(result) {
    if (!(0, client_1.isFullBlock)(result)) {
        return undefined;
    }
    switch (result.type) {
        case 'bulleted_list_item':
            return result;
        case 'to_do':
            return result;
        case 'numbered_list_item':
            return result;
        default:
            return undefined;
    }
}
//# sourceMappingURL=getListBlock.js.map