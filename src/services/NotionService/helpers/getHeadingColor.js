"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHeadingColor = void 0;
const client_1 = require("@notionhq/client");
const getHeadingColor = (block) => {
    if (!(0, client_1.isFullBlock)(block)) {
        return 'default';
    }
    switch (block.type) {
        case 'heading_1':
            return block.heading_1.color;
        case 'heading_2':
            return block.heading_2.color;
        case 'heading_3':
            return block.heading_3.color;
        default:
            return 'default';
    }
};
exports.getHeadingColor = getHeadingColor;
//# sourceMappingURL=getHeadingColor.js.map