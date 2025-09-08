"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isHeading = void 0;
const client_1 = require("@notionhq/client");
const isHeading = (block) => {
    if (!(0, client_1.isFullBlock)(block)) {
        return false;
    }
    switch (block.type) {
        case 'heading_1':
            return true;
        case 'heading_2':
            return true;
        case 'heading_3':
            return true;
        default:
            return false;
    }
};
exports.isHeading = isHeading;
//# sourceMappingURL=isHeading.js.map