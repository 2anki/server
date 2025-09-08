"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMaxUploadCount = getMaxUploadCount;
function getMaxUploadCount(paying) {
    const maxUploadCount = 21;
    if (paying) {
        return maxUploadCount * 100;
    }
    return maxUploadCount;
}
//# sourceMappingURL=getMaxUploadCount.js.map