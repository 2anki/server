"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getInputCard;
const Note_1 = __importDefault(require("../../../lib/parser/Note"));
const isColumnList_1 = __importDefault(require("./isColumnList"));
const getRichTextFromBlock_1 = require("./getRichTextFromBlock");
// The user wants to turn under lines into input cards <strong>keyword</strong> becomes {{type::word}}
function getInputCard(rules, block) {
    let isInput = false;
    let name = '';
    let answer = '';
    const flashcardBlock = (0, getRichTextFromBlock_1.getRichTextFromBlock)(block);
    if (!flashcardBlock || (0, isColumnList_1.default)(block)) {
        return undefined;
    }
    for (const cb of flashcardBlock) {
        const text = cb.text;
        if (cb.annotations.underline || cb.annotations.bold) {
            answer += text === null || text === void 0 ? void 0 : text.content;
            isInput = true;
        }
        else {
            name += text === null || text === void 0 ? void 0 : text.content;
        }
    }
    if (isInput) {
        const note = new Note_1.default(name, '');
        note.enableInput = isInput;
        note.answer = answer;
        return note;
    }
    return undefined;
}
//# sourceMappingURL=getInputCard.js.map