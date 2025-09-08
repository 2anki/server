"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NO_PACKAGE_ERROR = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const server_1 = require("react-dom/server");
exports.NO_PACKAGE_ERROR = new Error((0, server_1.renderToStaticMarkup)((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsxs)("div", { className: "info", children: ["Could not create a deck using your file(s) and rules. Make sure to at least create on valid toggle or verify your", ' ', (0, jsx_runtime_1.jsx)("a", { href: "/upload?view=template", children: "settings" }), ".", (0, jsx_runtime_1.jsx)("br", {}), " Alternatively, you can try to convert your file(s) using", ' ', (0, jsx_runtime_1.jsx)("a", { href: 'https://custom-format.2anki.net/custom-format', children: "2anki custom format" }), "."] }) })));
//# sourceMappingURL=constants.js.map