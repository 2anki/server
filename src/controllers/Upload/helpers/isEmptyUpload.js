"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEmptyUpload = isEmptyUpload;
function isEmptyUpload(files) {
    return !files || !Array.isArray(files) || files.length === 0;
}
//# sourceMappingURL=isEmptyUpload.js.map