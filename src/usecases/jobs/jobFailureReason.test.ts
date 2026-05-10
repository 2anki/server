import { EmptyDeckError } from './EmptyDeckError';
import {
  EMPTY_DECK_FAILURE_REASON,
  jobFailureReasonFromError,
} from './jobFailureReason';

describe('jobFailureReasonFromError', () => {
  it('returns the friendly reason for EmptyDeckError', () => {
    const reason = jobFailureReasonFromError(new EmptyDeckError());
    expect(reason).toBe(EMPTY_DECK_FAILURE_REASON);
    expect(reason).not.toMatch(/^Technical error /);
  });

  it('returns the technical fallback for any other error', () => {
    const reason = jobFailureReasonFromError(new Error('boom'));
    expect(reason).toBe('Technical error Error: boom');
  });
});
