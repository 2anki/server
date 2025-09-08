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
        // Handle underscore-based cloze deletions
        for (let i = 0; i < answerList.length; i++) {
            if (clozeSentence.includes('_')) {
                clozeSentence = clozeSentence.replace(/_+/, `{{c${i + 1}::${answerList[i]}}}`);
            }
        }
        // Handle backtick-enclosed cloze deletions
        const backtickRegex = /`([^`]+)`/g;
        let match;
        let clozeIndex = 1;
        // If we've already processed underscores, start from the next index
        if (answerList.length > 0 && clozeSentence.includes('{{c')) {
            clozeIndex = answerList.length + 1;
        }
        // Replace each backtick-enclosed text with cloze syntax
        while ((match = backtickRegex.exec(sentence)) !== null) {
            const backtickText = match[1];
            clozeSentence = clozeSentence.replace(`\`${backtickText}\``, `{{c${clozeIndex}::${backtickText}}}`);
            clozeIndex++;
        }
        return {
            front: clozeSentence,
            isCloze: true,
        };
    }
    getBasicFlashcard(flashcardText) {
        let front, back;
        if (flashcardText.includes(' - ')) {
            [front, back] = flashcardText.split(' - ');
        }
        else if (flashcardText.includes(' = ')) {
            [front, back] = flashcardText.split(' = ');
        }
        else {
            // If neither separator is found, treat the entire text as the front
            front = flashcardText;
            back = '';
        }
        return {
            front: front,
            back: back,
        };
    }
    parse(input) {
        const flashcards = [];
        const bulletPoints = input.split(/\n\n|\n- /);
        for (const bulletPoint of bulletPoints) {
            // Split by both " - " and " = "
            let question, answers;
            if (bulletPoint.includes(' - ')) {
                [question, answers] = bulletPoint.split(' - ');
            }
            else if (bulletPoint.includes(' = ')) {
                [question, answers] = bulletPoint.split(' = ');
            }
            else {
                // If neither separator is found, treat as a basic flashcard
                flashcards.push(this.getBasicFlashcard(bulletPoint));
                continue;
            }
            // Check if answers contain backticks (cloze markers)
            if (answers && answers.includes('`')) {
                // Extract the content inside backticks
                const backtickMatch = answers.match(/`([^`]+)`/);
                if (backtickMatch && backtickMatch[1]) {
                    const clozeContent = backtickMatch[1];
                    // Create a cloze card with the content from backticks
                    flashcards.push({
                        front: question.replace(/^- /, '') + ` {{c1::${clozeContent}}}`,
                        isCloze: true,
                    });
                    continue;
                }
            }
            // Check if answers contain underscores (cloze markers)
            if (answers && answers.includes('_')) {
                // If answer is just underscores, use the first word from the question
                if (answers.trim() === '___') {
                    const firstWord = question.replace(/^- /, '').split(',')[0].trim();
                    flashcards.push({
                        front: question
                            .replace(/^- /, '')
                            .replace(firstWord, `{{c1::${firstWord}}}`),
                        isCloze: true,
                    });
                    continue;
                }
            }
            // Check if question might be a cloze card
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