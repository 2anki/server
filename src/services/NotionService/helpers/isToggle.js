"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = isToggle;
const client_1 = require("@notionhq/client");
function isToggle(block) {
    if (!(0, client_1.isFullBlock)(block)) {
        return false;
    }
    return block.type === 'toggle';
}
//# sourceMappingURL=isToggle.js.map