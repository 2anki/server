"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getListColor = void 0;
const getListColor = (block) => {
    switch (block.type) {
        case 'to_do':
            return block.to_do.color;
        case 'bulleted_list_item':
            return block.bulleted_list_item
                .color;
        case 'numbered_list_item':
            return block.numbered_list_item
                .color;
        default:
            return undefined;
    }
};
exports.getListColor = getListColor;
//# sourceMappingURL=getListColor.js.map