import { PythonExitError } from '../../lib/anki/buildPythonExitError';
import { EmptyDeckError } from './EmptyDeckError';

export const EMPTY_DECK_FAILURE_REASON =
  "No cards in this deck yet. 2anki turns Notion toggle blocks into flashcards — the toggle title becomes the question, what's inside is the answer. Wrap your key terms in toggles in Notion, then convert again.";

function genericFailureReason(jobId = 'unavailable'): string {
  return `Something went wrong on our end converting this page. Email support@2anki.net with job ID ${jobId} and we'll take a look.`;
}

export function jobFailureReasonFromError(
  error: unknown,
  jobId?: string
): string {
  if (error instanceof EmptyDeckError) {
    return EMPTY_DECK_FAILURE_REASON;
  }
  if (error instanceof PythonExitError) {
    return error.message;
  }
  return genericFailureReason(jobId);
}
