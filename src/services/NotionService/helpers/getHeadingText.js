"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHeadingText = void 0;
const client_1 = require("@notionhq/client");
const getHeading_1 = require("../blocks/helpers/getHeading");
const getHeadingText = (block) => {
    if (!(0, client_1.isFullBlock)(block)) {
        return undefined;
    }
    const heading = (0, getHeading_1.getHeading)(block);
    return heading === null || heading === void 0 ? void 0 : heading.rich_text;
};
exports.getHeadingText = getHeadingText;
//# sourceMappingURL=getHeadingText.js.map