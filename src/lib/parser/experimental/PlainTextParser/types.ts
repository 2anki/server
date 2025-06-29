export interface ClozeCard {
  isCloze: boolean;
  front: string;
  extra?: string;
}

export interface BasicCard {
  front: string;
  back: string;
  tags?: string;
}

export type Flashcard = ClozeCard | BasicCard;

export const isClozeFlashcard = (
  flashcard: Flashcard
): flashcard is ClozeCard =>
  'isCloze' in flashcard && flashcard.isCloze === true;

export const isBasicFlashcard = (
  flashcard: Flashcard
): flashcard is BasicCard =>
  'back' in flashcard && flashcard.back !== undefined;

export const isPossiblyClozeFlashcard = (question: string) => {
  return (
    (question.includes('_') || question.includes('`')) &&
    (question.includes('-') || question.includes('='))
  );
};
