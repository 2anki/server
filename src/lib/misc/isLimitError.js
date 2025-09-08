"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLimitError = void 0;
const convertPDFToImages_1 = require("../../infrastracture/adapters/fileConversion/convertPDFToImages");
const LIMIT_MESSAGES = [
    'File too large',
    'You can only add 100 cards',
    'Your request has hit the limit',
    convertPDFToImages_1.PDF_EXCEEDS_MAX_PAGE_LIMIT,
];
const isLimitError = (error) => {
    if (!error) {
        return false;
    }
    return LIMIT_MESSAGES.some((msg) => error.message.includes(msg));
};
exports.isLimitError = isLimitError;
//# sourceMappingURL=isLimitError.js.map