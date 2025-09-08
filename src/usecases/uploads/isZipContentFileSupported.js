"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isZipContentFileSupported = void 0;
const checks_1 = require("../../lib/storage/checks");
const isFileWithoutExtension = (filename) => filename && filename.indexOf('.') === -1;
const isZipContentFileSupported = (filename) => {
    var _a, _b, _c, _d, _e, _f;
    return (_f = (_e = (_d = (_c = (_b = (_a = (0, checks_1.isHTMLFile)(filename)) !== null && _a !== void 0 ? _a : (0, checks_1.isMarkdownFile)(filename)) !== null && _b !== void 0 ? _b : (0, checks_1.isPlainText)(filename)) !== null && _c !== void 0 ? _c : (0, checks_1.isCSVFile)(filename)) !== null && _d !== void 0 ? _d : (0, checks_1.isPDFFile)(filename)) !== null && _e !== void 0 ? _e : (0, checks_1.isXLSXFile)(filename)) !== null && _f !== void 0 ? _f : isFileWithoutExtension(filename);
};
exports.isZipContentFileSupported = isZipContentFileSupported;
//# sourceMappingURL=isZipContentFileSupported.js.map