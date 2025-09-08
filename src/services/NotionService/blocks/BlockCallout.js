"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockCallout = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const server_1 = __importDefault(require("react-dom/server"));
const getPlainText_1 = __importDefault(require("../helpers/getPlainText"));
const NotionColors_1 = require("../NotionColors");
const HandleBlockAnnotations_1 = __importDefault(require("./HandleBlockAnnotations"));
const BlockCallout = (block, handler) => {
    var _a;
    const { callout } = block;
    const { icon } = callout;
    const { rich_text: richText } = callout;
    if ((_a = handler.settings) === null || _a === void 0 ? void 0 : _a.isTextOnlyBack) {
        return (0, getPlainText_1.default)(richText);
    }
    return server_1.default.renderToStaticMarkup((0, jsx_runtime_1.jsxs)("figure", { id: block.id, className: `callout${(0, NotionColors_1.styleWithColors)(callout.color)}`, style: { whiteSpace: 'pre-wrap', display: 'flex' }, children: [(0, jsx_runtime_1.jsx)("div", { children: icon && icon.type === 'emoji' && ((0, jsx_runtime_1.jsx)("span", { className: "icon", children: icon.emoji })) }), (0, jsx_runtime_1.jsx)("div", { style: { width: '100%' }, children: richText.map((t) => {
                    const { annotations } = t;
                    return (0, HandleBlockAnnotations_1.default)(annotations, t);
                }) })] }));
};
exports.BlockCallout = BlockCallout;
//# sourceMappingURL=BlockCallout.js.map