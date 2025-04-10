"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlainTextParser = void 0;
const types_1 = require("./types");
class PlainTextParser {
    getOneOrMoreAnswers(answers) {
        const answerList = answers.split(', ');
        if (answerList.length === 0) {
            return [answers];
        }
        return answerList;
    }
    fillInTheBlanks(sentence, answers) {
        const answerList = this.getOneOrMoreAnswers(answers);
        let clozeSentence = sentence;
        for (let i = 0; i < answerList.length; i++) {
            clozeSentence = clozeSentence.replace(/_+/, `{{c${i + 1}::${answerList[i]}}}`);
        }
        return {
            front: clozeSentence,
            isCloze: true,
        };
    }
    getBasicFlashcard(flashcardText) {
        const [front, back] = flashcardText.split(' - ');
        return {
            front: front,
            back: back,
        };
    }
    parse(input) {
        const flashcards = [];
        const bulletPoints = input.split(/\n\n|\n- /);
        for (const bulletPoint of bulletPoints) {
            const [question, answers] = bulletPoint.split(' - ');
            if (answers && (0, types_1.isPossiblyClozeFlashcard)(question)) {
                const clozeCard = this.fillInTheBlanks(question, answers);
                if (clozeCard) {
                    flashcards.push(clozeCard);
                }
                continue;
            }
            flashcards.push(this.getBasicFlashcard(bulletPoint));
        }
        return flashcards;
    }
}
exports.PlainTextParser = PlainTextParser;
//# sourceMappingURL=PlainTextParser.js.map