"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUploadLimits = void 0;
const FREE_USER_MAX_FIELD_SIZE = 2 * 1024 * 1024;
const FREE_USER_MAX_UPLOAD_SIZE = 100 * 1024 * 1024;
const PAYING_MAX_FIELD_SIZE = FREE_USER_MAX_FIELD_SIZE * 10;
const PAYING_MAX_UPLOAD_SIZE = FREE_USER_MAX_UPLOAD_SIZE * 100;
const getUploadLimits = (paying) => {
    if (paying) {
        return {
            fileSize: PAYING_MAX_UPLOAD_SIZE,
            fieldSize: PAYING_MAX_FIELD_SIZE,
        };
    }
    return {
        fileSize: FREE_USER_MAX_UPLOAD_SIZE,
        fieldSize: FREE_USER_MAX_FIELD_SIZE,
    };
};
exports.getUploadLimits = getUploadLimits;
//# sourceMappingURL=getUploadLimits.js.map