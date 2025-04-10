"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockToggleList = BlockToggleList;
const jsx_runtime_1 = require("react/jsx-runtime");
const server_1 = __importDefault(require("react-dom/server"));
const html_to_text_1 = require("html-to-text");
const renderTextChildren_1 = __importDefault(require("../../helpers/renderTextChildren"));
const getChildren_1 = __importDefault(require("../../helpers/getChildren"));
const NotionColors_1 = require("../../NotionColors");
function BlockToggleList(block, handler) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const list = block.toggle;
        const { rich_text: richText } = list;
        const backSide = yield (0, getChildren_1.default)(block, handler);
        /**
         * We can't just set open to false that won't work since it's a boolean and will be truthy.
         * The open attribute has to be omitted.
         */
        const Details = ({ children }) => {
            var _a;
            return ((_a = handler.settings) === null || _a === void 0 ? void 0 : _a.toggleMode) === 'open_toggle' ? ((0, jsx_runtime_1.jsx)("details", { open: true, children: children })) : ((0, jsx_runtime_1.jsx)("details", { children: children }));
        };
        const markup = server_1.default.renderToStaticMarkup((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsx)("ul", { id: block.id, className: `toggle${(0, NotionColors_1.styleWithColors)(list.color)}`, children: (0, jsx_runtime_1.jsx)("li", { children: (0, jsx_runtime_1.jsxs)(Details, { children: [(0, jsx_runtime_1.jsx)("summary", { dangerouslySetInnerHTML: {
                                    __html: (0, renderTextChildren_1.default)(richText, handler.settings),
                                } }), (0, jsx_runtime_1.jsx)("div", { dangerouslySetInnerHTML: { __html: backSide } })] }) }) }) }));
        if ((_a = handler.settings) === null || _a === void 0 ? void 0 : _a.isTextOnlyBack) {
            return (0, html_to_text_1.convert)(markup);
        }
        return markup;
    });
}
//# sourceMappingURL=BlockToggleList.js.map