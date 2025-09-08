"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPossiblyClozeFlashcard = exports.isBasicFlashcard = exports.isClozeFlashcard = void 0;
const isClozeFlashcard = (flashcard) => 'isCloze' in flashcard && flashcard.isCloze === true;
exports.isClozeFlashcard = isClozeFlashcard;
const isBasicFlashcard = (flashcard) => 'back' in flashcard && flashcard.back !== undefined;
exports.isBasicFlashcard = isBasicFlashcard;
const isPossiblyClozeFlashcard = (question) => {
    return ((question.includes('_') || question.includes('`')) &&
        (question.split('-') || question.split('=')));
};
exports.isPossiblyClozeFlashcard = isPossiblyClozeFlashcard;
//# sourceMappingURL=types.js.map