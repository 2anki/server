"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markdownToHTML = void 0;
const showdown_1 = __importDefault(require("showdown"));
const markdownToHTML = (html, trimWhitespace = false) => {
    const converter = new showdown_1.default.Converter({
        noHeaderId: true,
        disableForced4SpacesIndentedSublists: true,
        simpleLineBreaks: true,
    });
    converter.setFlavor('github');
    let processedHtml = html;
    if (trimWhitespace) {
        processedHtml = html.trim();
    }
    const htmlWithoutPreTags = converter
        .makeHtml(processedHtml)
        .replace(/<pre><code>|<\/code><\/pre>/g, '');
    return htmlWithoutPreTags;
};
exports.markdownToHTML = markdownToHTML;
//# sourceMappingURL=markdown.js.map