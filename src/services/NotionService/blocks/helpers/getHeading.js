"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHeading = void 0;
const getHeading = (block) => {
    switch (block === null || block === void 0 ? void 0 : block.type) {
        case 'heading_1':
            return block.heading_1;
        case 'heading_2':
            return block.heading_2;
        case 'heading_3':
            return block.heading_3;
        default:
            return undefined;
    }
};
exports.getHeading = getHeading;
//# sourceMappingURL=getHeading.js.map