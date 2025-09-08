"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = renderTextChildren;
const jsx_runtime_1 = require("react/jsx-runtime");
const server_1 = __importDefault(require("react-dom/server"));
const BlockEquation_1 = __importDefault(require("../blocks/BlockEquation"));
const HandleBlockAnnotations_1 = __importDefault(require("../blocks/HandleBlockAnnotations"));
const isEquation_1 = __importDefault(require("./isEquation"));
const isText_1 = __importDefault(require("./isText"));
const preserveNewlinesIfApplicable_1 = __importDefault(require("./preserveNewlinesIfApplicable"));
function renderTextChildren(text, settings) {
    if (!text || (text === null || text === void 0 ? void 0 : text.length) === 0) {
        return '';
    }
    const content = text
        .map((t) => {
        if ((0, isEquation_1.default)(t)) {
            return (0, BlockEquation_1.default)(t);
        }
        if ((0, isText_1.default)(t)) {
            const { annotations } = t;
            return server_1.default.renderToStaticMarkup((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, HandleBlockAnnotations_1.default)(annotations, t) }));
        }
        return `unsupported type: ${t.type}\n${JSON.stringify(t, null, 2)}`;
    })
        .reduce((acc, curr) => acc + curr);
    return (0, preserveNewlinesIfApplicable_1.default)(content, settings);
}
//# sourceMappingURL=renderTextChildren.js.map