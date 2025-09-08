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
exports.default = getListItems;
const jsx_runtime_1 = require("react/jsx-runtime");
const renderTextChildren_1 = __importDefault(require("./renderTextChildren"));
const getChildren_1 = __importDefault(require("./getChildren"));
const getListBlock_1 = require("./getListBlock");
const getListColor_1 = require("./getListColor");
const getRichTextFromBlock_1 = require("./getRichTextFromBlock");
const NotionColors_1 = require("../NotionColors");
function getListItems(response, handler, type) {
    if (!response) {
        return [];
    }
    return Promise.all(response.results.map((result) => __awaiter(this, void 0, void 0, function* () {
        const list = (0, getListBlock_1.getListBlock)(result);
        if (!list) {
            return null;
        }
        const backSide = yield (0, getChildren_1.default)(list, handler);
        handler.skip.push(result.id);
        const todo = type === 'to_do' ? list.to_do : null;
        const checked = (todo === null || todo === void 0 ? void 0 : todo.checked)
            ? 'to-do-children-checked'
            : 'to-do-children-unchecked';
        const checkedClass = todo ? checked : '';
        return ((0, jsx_runtime_1.jsxs)("li", { id: result.id, className: `${(0, NotionColors_1.styleWithColors)((0, getListColor_1.getListColor)(list))}`, children: [todo && ((0, jsx_runtime_1.jsx)("div", { className: `checkbox checkbox-${checked ? 'on' : 'off'}` })), (0, jsx_runtime_1.jsx)("div", { dangerouslySetInnerHTML: {
                        __html: (0, renderTextChildren_1.default)((0, getRichTextFromBlock_1.getRichTextFromBlock)(list), handler.settings),
                    } }), backSide && ((0, jsx_runtime_1.jsx)("div", { className: `${checkedClass}`, dangerouslySetInnerHTML: { __html: backSide } }))] }));
    })));
}
//# sourceMappingURL=getListItems.js.map