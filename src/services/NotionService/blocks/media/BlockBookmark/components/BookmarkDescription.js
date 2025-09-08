"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookmarkDescription = BookmarkDescription;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
function BookmarkDescription({ description }) {
    if (!description) {
        return null;
    }
    return (0, jsx_runtime_1.jsx)("div", { className: "bookmark-description", children: description });
}
//# sourceMappingURL=BookmarkDescription.js.map