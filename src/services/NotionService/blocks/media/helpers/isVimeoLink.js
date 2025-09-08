"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isVimeoLink = void 0;
const checks_1 = require("../../../../../lib/storage/checks");
const isVimeoLink = (url) => {
    if (!url) {
        return null;
    }
    return (0, checks_1.isVimeoURL)(url);
};
exports.isVimeoLink = isVimeoLink;
//# sourceMappingURL=isVimeoLink.js.map