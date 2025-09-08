"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTemplate = void 0;
const parseTemplate = (json) => {
    if (!json) {
        return undefined;
    }
    return JSON.parse(json);
};
exports.parseTemplate = parseTemplate;
//# sourceMappingURL=parseTemplate.js.map