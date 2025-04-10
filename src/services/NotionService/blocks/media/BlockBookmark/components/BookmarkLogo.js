"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookmarkLogo = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const BookmarkLogo = ({ logo }) => {
    if (!logo) {
        return null;
    }
    return (0, jsx_runtime_1.jsx)("img", { src: logo, className: "icon bookmark-icon" });
};
exports.BookmarkLogo = BookmarkLogo;
//# sourceMappingURL=BookmarkLogo.js.map