"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotionId = void 0;
const getNotionId = (query) => {
    if (!(query === null || query === void 0 ? void 0 : query.includes('/'))) {
        return undefined;
    }
    const comps = query.split('/');
    const title = comps[comps.length - 1];
    const parts = title.split('-');
    return parts[parts.length - 1];
};
exports.getNotionId = getNotionId;
//# sourceMappingURL=getNotionId.js.map