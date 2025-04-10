"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const server_1 = __importDefault(require("react-dom/server"));
const RenderNotionLink = (link, handler) => {
    var _a;
    if ((_a = handler.settings) === null || _a === void 0 ? void 0 : _a.isTextOnlyBack) {
        return link;
    }
    return server_1.default.renderToStaticMarkup((0, jsx_runtime_1.jsx)("div", { style: { textAlign: 'center' }, children: (0, jsx_runtime_1.jsx)("a", { style: { textDecoration: 'none', color: 'grey' }, href: link, children: "Open in Notion" }) }));
};
exports.default = RenderNotionLink;
//# sourceMappingURL=RenderNotionLink.js.map