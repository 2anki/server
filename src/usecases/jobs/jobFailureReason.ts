import { EmptyDeckError } from './EmptyDeckError';

export const EMPTY_DECK_FAILURE_REASON =
  "No cards in this deck yet. 2anki turns Notion toggle blocks (the little triangles you click to expand) into flashcards — the toggle title becomes the question, what's inside becomes the answer. We didn't find any in this page. Open the page in Notion, wrap your key terms in toggles, then convert again. See examples: /documentation/help/common-problems#could-not-create-a-deck-using-your-file-and-rules";

export function jobFailureReasonFromError(error: unknown): string {
  if (error instanceof EmptyDeckError) {
    return EMPTY_DECK_FAILURE_REASON;
  }
  return 'Technical error ' + error;
}
