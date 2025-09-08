"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTitleFromMarkdown = getTitleFromMarkdown;
function getTitleFromMarkdown(contents) {
    return contents === null || contents === void 0 ? void 0 : contents.split('\n')[0].replace(/^#\s/, '');
}
//# sourceMappingURL=getTitleFromMarkdown.js.map