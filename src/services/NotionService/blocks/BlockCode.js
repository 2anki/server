"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const server_1 = __importDefault(require("react-dom/server"));
const getPlainText_1 = __importDefault(require("../helpers/getPlainText"));
const HandleBlockAnnotations_1 = __importDefault(require("./HandleBlockAnnotations"));
const BlockCode = (block, handler) => {
    var _a;
    const { code } = block;
    const { rich_text: richText } = code;
    if ((_a = handler.settings) === null || _a === void 0 ? void 0 : _a.isTextOnlyBack) {
        return (0, getPlainText_1.default)(richText);
    }
    return server_1.default.renderToStaticMarkup((0, jsx_runtime_1.jsx)("pre", { id: block.id, className: `code}`, children: (0, jsx_runtime_1.jsx)("code", { children: richText.map((t) => {
                const { annotations } = t;
                return (0, HandleBlockAnnotations_1.default)(annotations, t);
            }) }) }));
};
exports.default = BlockCode;
//# sourceMappingURL=BlockCode.js.map