"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const server_1 = __importDefault(require("react-dom/server"));
const html_to_text_1 = require("html-to-text");
const renderTextChildren_1 = __importDefault(require("../helpers/renderTextChildren"));
const NotionColors_1 = require("../NotionColors");
const BlockParagraph = (block, handler) => {
    var _a;
    const { paragraph } = block;
    const { rich_text: richText } = paragraph;
    const markup = server_1.default.renderToStaticMarkup((0, jsx_runtime_1.jsx)("p", { className: (0, NotionColors_1.styleWithColors)(paragraph.color), id: block.id, dangerouslySetInnerHTML: {
            __html: (0, renderTextChildren_1.default)(richText, handler.settings),
        } }));
    if ((_a = handler.settings) === null || _a === void 0 ? void 0 : _a.isTextOnlyBack) {
        return (0, html_to_text_1.convert)(markup);
    }
    return markup;
};
exports.default = BlockParagraph;
//# sourceMappingURL=BlockParagraph.js.map