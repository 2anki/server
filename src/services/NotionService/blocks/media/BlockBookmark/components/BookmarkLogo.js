"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookmarkLogo = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const BookmarkLogo = ({ logo }) => {
    if (!logo) {
        return null;
    }
    return (0, jsx_runtime_1.jsx)("img", { src: logo, className: "icon bookmark-icon" });
};
exports.BookmarkLogo = BookmarkLogo;
//# sourceMappingURL=BookmarkLogo.js.map