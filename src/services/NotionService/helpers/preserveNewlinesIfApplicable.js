"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = preserveNewlinesIfApplicable;
function preserveNewlinesIfApplicable(text, settings) {
    if (settings.perserveNewLines) {
        return text.replace(/\n/g, '<br />');
    }
    return text;
}
//# sourceMappingURL=preserveNewlinesIfApplicable.js.map