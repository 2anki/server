"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = replaceAll;
function replaceAll(original, oldValue, newValue) {
    // escaping all special Characters
    const escaped = oldValue.replace(/[{}()[\].?*+$^\\/]/g, '\\$&');
    // creating regex with global flag
    const reg = new RegExp(escaped, 'g');
    return original.replace(reg, newValue);
}
//# sourceMappingURL=replaceAll.js.map