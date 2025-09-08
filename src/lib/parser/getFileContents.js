"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileContents = getFileContents;
const checks_1 = require("../storage/checks");
const markdown_1 = require("../markdown");
function getFileContents(file, convertToHTML = true) {
    const contents = file === null || file === void 0 ? void 0 : file.contents;
    if (!file || !contents) {
        return undefined;
    }
    if ((0, checks_1.isHTMLFile)(file.name)) {
        return file.contents;
    }
    if ((0, checks_1.isMarkdownFile)(file.name) && convertToHTML) {
        return (0, markdown_1.markdownToHTML)(contents.toString());
    }
    return contents.toString();
}
//# sourceMappingURL=getFileContents.js.map