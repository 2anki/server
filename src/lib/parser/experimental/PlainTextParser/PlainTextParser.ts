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

    // Handle underscore-based cloze deletions
    for (let i = 0; i < answerList.length; i++) {
      if (clozeSentence.includes('_')) {
        clozeSentence = clozeSentence.replace(
          /_+/,
          `{{c${i + 1}::${answerList[i]}}}`
        );
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
      clozeSentence = clozeSentence.replace(
        `\`${backtickText}\``,
        `{{c${clozeIndex}::${backtickText}}}`
      );
      clozeIndex++;
    }

    return {
      front: clozeSentence,
      isCloze: true,
    };
  }

  getBasicFlashcard(flashcardText: string): BasicCard {
    let front, back;

    if (flashcardText.includes(' - ')) {
      [front, back] = flashcardText.split(' - ');
    } else if (flashcardText.includes(' = ')) {
      [front, back] = flashcardText.split(' = ');
    } else {
      // If neither separator is found, treat the entire text as the front
      front = flashcardText;
      back = '';
    }

    return {
      front: front,
      back: back,
    };
  }

  parse(input: string): Flashcard[] {
    const flashcards = [];
    const bulletPoints = input.split(/\n\n|\n- /);

    for (const bulletPoint of bulletPoints) {
      // Split by both " - " and " = "
      let question, answers;
      if (bulletPoint.includes(' - ')) {
        [question, answers] = bulletPoint.split(' - ');
      } else if (bulletPoint.includes(' = ')) {
        [question, answers] = bulletPoint.split(' = ');
      } else {
        // If neither separator is found, treat as a basic flashcard
        flashcards.push(this.getBasicFlashcard(bulletPoint));
        continue;
      }

      if (answers && isPossiblyClozeFlashcard(question)) {
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
