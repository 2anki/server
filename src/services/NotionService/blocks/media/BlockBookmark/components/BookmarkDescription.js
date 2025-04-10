"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookmarkDescription = BookmarkDescription;
const jsx_runtime_1 = require("react/jsx-runtime");
function BookmarkDescription({ description }) {
    if (!description) {
        return null;
    }
    return (0, jsx_runtime_1.jsx)("div", { className: "bookmark-description", children: description });
}
//# sourceMappingURL=BookmarkDescription.js.map