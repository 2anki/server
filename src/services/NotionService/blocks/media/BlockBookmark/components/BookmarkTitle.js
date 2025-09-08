"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookmarkTitle = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const BookmarkTitle = ({ title }) => {
    if (!title) {
        return null;
    }
    return (0, jsx_runtime_1.jsx)("div", { className: "bookmark-title", children: title });
};
exports.BookmarkTitle = BookmarkTitle;
//# sourceMappingURL=BookmarkTitle.js.map