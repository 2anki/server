"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const TagRegistry_1 = __importDefault(require("../../../lib/parser/TagRegistry"));
const HandleBlockAnnotations = (annotations, text) => {
    if (!text) {
        return null;
    }
    const content = text.plain_text;
    if (annotations.underline) {
        return ((0, jsx_runtime_1.jsx)("span", { style: {
                borderBottom: annotations.underline ? '0.05em solid' : '',
            }, children: content }));
    }
    if (annotations.bold) {
        return (0, jsx_runtime_1.jsx)("strong", { children: content });
    }
    if (annotations.italic) {
        return (0, jsx_runtime_1.jsx)("em", { children: content });
    }
    if (annotations.strikethrough) {
        TagRegistry_1.default.getInstance().addStrikethrough(content);
        return (0, jsx_runtime_1.jsx)("del", { children: content });
    }
    if (annotations.code) {
        return (0, jsx_runtime_1.jsx)("code", { children: content });
    }
    return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: content });
};
exports.default = HandleBlockAnnotations;
//# sourceMappingURL=HandleBlockAnnotations.js.map