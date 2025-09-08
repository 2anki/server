"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canAccess = void 0;
const MAX_FILE_NAME_LENGTH = 255;
const canAccess = (thePath, basePath) => {
    console.log('canAccess', thePath, basePath);
    if (thePath.includes('..')) {
        return false;
    }
    if (thePath.includes('~')) {
        return false;
    }
    if (basePath) {
        return thePath.startsWith(basePath);
    }
    if (thePath.length >= MAX_FILE_NAME_LENGTH) {
        return false;
    }
    return /^[\w\-. ]+$/.test(thePath);
};
exports.canAccess = canAccess;
//# sourceMappingURL=canAccess.js.map