"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookmarkImage = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const BookmarkImage = ({ image }) => {
    if (!image) {
        return null;
    }
    return (0, jsx_runtime_1.jsx)("img", { src: image, className: "bookmark-image" });
};
exports.BookmarkImage = BookmarkImage;
//# sourceMappingURL=BookmarkImage.js.map