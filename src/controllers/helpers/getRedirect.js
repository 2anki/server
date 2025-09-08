"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRedirect = void 0;
const getRedirect = (req) => { var _a, _b; return (_b = (_a = req.query.redirect) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '/search'; };
exports.getRedirect = getRedirect;
//# sourceMappingURL=getRedirect.js.map