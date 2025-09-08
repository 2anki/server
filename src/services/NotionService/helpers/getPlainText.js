"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getPlainText;
function getPlainText(text) {
    if (!text || text.length === 0) {
        return '';
    }
    return text
        .map((t) => t.plain_text)
        .reduce((acc, curr) => `${acc}<br>${curr}`);
}
//# sourceMappingURL=getPlainText.js.map