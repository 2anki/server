import {
  BasicCard,
  ClozeCard,
  Flashcard,
  isPossiblyClozeFlashcard,
} from './types';

export class PlainTextParser {
  getOneOrMoreAnswers(answers: string): string[] {
    const answerList = answers.split(', ');

    if (answerList.length === 0) {
      return [answers];
    }
    
    return answerList;
  }

  fillInTheBlanks(sentence: string, answers: string): ClozeCard {
    const answerList = this.getOneOrMoreAnswers(answers);
    let clozeSentence = sentence;

    for (let i = 0; i < answerList.length; i++) {
      clozeSentence = clozeSentence.replace(
        /_+/,
        `{{c${i + 1}::${answerList[i]}}}`
      );
    }

    return {
      front: clozeSentence,
      isCloze: true,
    };
  }

  getBasicFlashcard(flashcardText: string): BasicCard {
    const [front, back] = flashcardText.split(' - ');

    return {
      front: front,
      back: back,
    };
  }

  parse(input: string): Flashcard[] {
    const flashcards = [];
    const bulletPoints = input.split(/\n\n|\n- /);

    for (const bulletPoint of bulletPoints) {
      const [question, answers] = bulletPoint.split(' - ');

      if (answers && isPossiblyClozeFlashcard(question)) {
        const cards = this.fillInTheBlanks(question, answers);
        if (cards) {
          flashcards.push(cards);
        }
        continue;
      }

      flashcards.push(this.getBasicFlashcard(bulletPoint));
    }

    return flashcards;
  }
}
