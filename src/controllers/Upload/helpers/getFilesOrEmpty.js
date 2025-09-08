"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFilesOrEmpty = getFilesOrEmpty;
function getFilesOrEmpty(body) {
    if (body === undefined || body === null) {
        return [];
    }
    return body.files ? JSON.parse(body.files) : [];
}
//# sourceMappingURL=getFilesOrEmpty.js.map