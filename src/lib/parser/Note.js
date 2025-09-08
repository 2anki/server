"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Note {
    constructor(name, back) {
        this.cloze = false;
        this.number = 0;
        this.enableInput = false;
        this.answer = '';
        this.media = [];
        this.name = name;
        this.back = back;
        this.tags = [];
    }
    hasCherry() {
        const cherry = '&#x1F352;';
        return ((this.name && (this.name.includes(cherry) || this.name.includes('🍒'))) ||
            (this.back && (this.back.includes(cherry) || this.back.includes('🍒'))));
    }
    hasAvocado() {
        const avocado = '&#x1F951';
        return ((this.name &&
            (this.name.includes(avocado) || this.name.includes('🥑'))) ||
            (this.back && (this.back.includes(avocado) || this.back.includes('🥑'))));
    }
    copyValues(clozeCard) {
        this.name = clozeCard.name;
        this.back = clozeCard.back;
        this.tags = clozeCard.tags;
        this.cloze = clozeCard.cloze;
        this.number = clozeCard.number;
        this.enableInput = clozeCard.enableInput;
        this.answer = clozeCard.answer;
        this.media = clozeCard.media;
        this.notionId = clozeCard.notionId;
        this.notionLink = clozeCard.notionLink;
    }
    hasRefreshIcon() {
        return this.name.includes('&#x1F504') || this.name.includes('🔄');
    }
    reversed(input) {
        const note = new Note(input.back, input.name);
        note.tags = input.tags;
        note.media = input.media;
        // Due to backwards compatability, do not increment number here
        note.number = -1;
        return note;
    }
    isValidBasicNote() {
        if (!this.name || !this.back) {
            return false;
        }
        return this.name.trim().length > 0 && this.back.trim().length > 0;
    }
    isValidClozeNote() {
        return this.cloze && this.name && this.name.trim();
    }
    isValidInputNote() {
        return this.enableInput && this.name && this.answer && this.answer.trim();
    }
}
exports.default = Note;
//# sourceMappingURL=Note.js.map