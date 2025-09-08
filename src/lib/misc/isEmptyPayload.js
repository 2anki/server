"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEmptyPayload = void 0;
const isEmptyPayload = (files) => {
    if (!files || !Array.isArray(files) || files.length === 0) {
        return true;
    }
    const totalBytes = files.reduce((acc, file) => acc + file.size, 0);
    return totalBytes === 0;
};
exports.isEmptyPayload = isEmptyPayload;
//# sourceMappingURL=isEmptyPayload.js.map