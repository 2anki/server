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
exports.BlockNumberedList = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const server_1 = __importDefault(require("react-dom/server"));
const html_to_text_1 = require("html-to-text");
const getListItems_1 = __importDefault(require("../../helpers/getListItems"));
const NotionColors_1 = require("../../NotionColors");
const BlockNumberedList = (block, response, handler) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const list = block.numbered_list_item;
    const items = yield (0, getListItems_1.default)(response, handler, 'numbered_list_item');
    const listItems = items.filter(Boolean);
    const markup = server_1.default.renderToStaticMarkup((0, jsx_runtime_1.jsx)("ol", { id: block.id, className: `numbered-list${(0, NotionColors_1.styleWithColors)(list.color)}`, children: listItems }));
    if ((_a = handler.settings) === null || _a === void 0 ? void 0 : _a.isTextOnlyBack) {
        return (0, html_to_text_1.convert)(markup);
    }
    return markup;
});
exports.BlockNumberedList = BlockNumberedList;
//# sourceMappingURL=BlockNumberedList.js.map