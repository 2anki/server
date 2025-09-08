"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DownloadTitle = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const DownloadTitle = ({ hasFiles }) => {
    return hasFiles ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("span", { "aria-hidden": "true", children: "\u2705" }), " Your Anki Decks Are Ready!"] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("span", { "aria-hidden": "true", children: "\u274C" }), " No Anki Decks Available"] }));
};
exports.DownloadTitle = DownloadTitle;
//# sourceMappingURL=DownloadTitle.js.map