"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookmarkContainer = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const BookmarkContainer = ({ url, children }) => {
    return ((0, jsx_runtime_1.jsx)("a", { style: { margin: '4px' }, href: url, className: "bookmark source", children: children }));
};
exports.BookmarkContainer = BookmarkContainer;
//# sourceMappingURL=BookmarkContainer.js.map