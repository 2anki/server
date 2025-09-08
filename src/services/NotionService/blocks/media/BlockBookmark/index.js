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
const jsx_runtime_1 = require("react/jsx-runtime");
const server_1 = __importDefault(require("react-dom/server"));
const html_to_text_1 = require("html-to-text");
const useMetadata_1 = __importDefault(require("./hooks/useMetadata"));
const react_1 = __importDefault(require("react"));
const BookmarkTitle_1 = require("./components/BookmarkTitle");
const BookmarkDescription_1 = require("./components/BookmarkDescription");
const BookmarkLogo_1 = require("./components/BookmarkLogo");
const BookmarkImage_1 = require("./components/BookmarkImage");
const BookmarkContainer_1 = require("./components/BookmarkContainer");
const BlockBookmark = (block, handler) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { bookmark } = block;
    const metadata = yield (0, useMetadata_1.default)(bookmark.url);
    if (((_a = handler.settings) === null || _a === void 0 ? void 0 : _a.isTextOnlyBack) && bookmark) {
        return `${metadata.title} ${bookmark.url}`;
    }
    const markup = server_1.default.renderToStaticMarkup((0, jsx_runtime_1.jsxs)(BookmarkContainer_1.BookmarkContainer, { url: bookmark.url, children: [(0, jsx_runtime_1.jsxs)("div", { className: "bookmark-info", children: [(0, jsx_runtime_1.jsxs)("div", { className: "bookmark-text", children: [(0, jsx_runtime_1.jsx)(BookmarkTitle_1.BookmarkTitle, { title: metadata.title }), (0, jsx_runtime_1.jsx)(BookmarkDescription_1.BookmarkDescription, { description: metadata.description })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bookmark-href", children: [(0, jsx_runtime_1.jsx)(BookmarkLogo_1.BookmarkLogo, { logo: metadata.logo }), bookmark.url] })] }), (0, jsx_runtime_1.jsx)(BookmarkImage_1.BookmarkImage, { image: metadata.image })] }));
    if ((_b = handler.settings) === null || _b === void 0 ? void 0 : _b.isTextOnlyBack) {
        return (0, html_to_text_1.convert)(markup);
    }
    return markup;
});
exports.default = BlockBookmark;
//# sourceMappingURL=index.js.map