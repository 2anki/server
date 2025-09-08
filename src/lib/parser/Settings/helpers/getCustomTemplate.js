"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomTemplate = void 0;
const getCustomTemplate = (storageKey, templates) => { var _a; return (_a = templates.find((tm) => tm.storageKey === storageKey)) !== null && _a !== void 0 ? _a : null; };
exports.getCustomTemplate = getCustomTemplate;
//# sourceMappingURL=getCustomTemplate.js.map