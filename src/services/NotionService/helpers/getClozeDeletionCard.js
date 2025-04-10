"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getClozeDeletionCard;
const Note_1 = __importDefault(require("../../../lib/parser/Note"));
const getRichTextFromBlock_1 = require("./getRichTextFromBlock");
const isColumnList_1 = __importDefault(require("./isColumnList"));
// The user wants to turn code blocks into cloze deletions <code>word</code> becomes {{c1::word}}
// This all should be tested with Jest
function getClozeDeletionCard(block) {
    let isCloze = false;
    let name = '';
    let index = 1;
    const richText = (0, getRichTextFromBlock_1.getRichTextFromBlock)(block);
    if (!richText || (0, isColumnList_1.default)(block)) {
        return undefined;
    }
    for (const cb of richText) {
        const text = cb.text;
        if (cb.annotations.code) {
            if (text === null || text === void 0 ? void 0 : text.content.includes('::')) {
                if (text === null || text === void 0 ? void 0 : text.content.match(/[cC]\d+::/)) {
                    name += `{{${text === null || text === void 0 ? void 0 : text.content}}}`;
                }
                else {
                    const clozeIndex = `{{c${index}::`;
                    if (!name.includes(clozeIndex)) {
                        name += `{{c${index}::${text === null || text === void 0 ? void 0 : text.content}}}`;
                    }
                }
            }
            else {
                name += `{{c${index}::${text === null || text === void 0 ? void 0 : text.content}}}`;
            }
            name = name.replace('{{{{', '{{').replace('}}}}', '}}');
            isCloze = true;
            index++;
        }
        else if (text === null || text === void 0 ? void 0 : text.content) {
            name += text === null || text === void 0 ? void 0 : text.content;
        }
    }
    if (isCloze) {
        const note = new Note_1.default(name, '');
        note.cloze = isCloze;
        return note;
    }
    return undefined;
}
//# sourceMappingURL=getClozeDeletionCard.js.map