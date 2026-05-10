import { buildPythonExitError } from '../../lib/anki/buildPythonExitError';
import { EmptyDeckError } from './EmptyDeckError';
import {
  EMPTY_DECK_FAILURE_REASON,
  jobFailureReasonFromError,
} from './jobFailureReason';

describe('jobFailureReasonFromError', () => {
  it('returns the EmptyDeckError reason unchanged', () => {
    const reason = jobFailureReasonFromError(new EmptyDeckError(), 'job-1');
    expect(reason).toBe(EMPTY_DECK_FAILURE_REASON);
  });

  it('returns the PythonExitError message verbatim (no "Technical error" prefix)', () => {
    const pythonError = buildPythonExitError({
      code: 1,
      stdout: '',
      stderr: "Unsupported 'data_source'!",
      jobId: 'job-py',
    });
    const reason = jobFailureReasonFromError(pythonError, 'job-py');
    expect(reason).toBe(pythonError.message);
    expect(reason).not.toMatch(/^Technical error/);
  });

  it('returns the generic fallback with job ID for an unknown error', () => {
    const reason = jobFailureReasonFromError(new Error('boom'), 'job-xyz');
    expect(reason).toBe(
      "Something went wrong on our end converting this page. Email support@2anki.net with job ID job-xyz and we'll take a look."
    );
  });

  it('never produces a string starting with "Technical error"', () => {
    const reasons = [
      jobFailureReasonFromError(new EmptyDeckError(), 'j1'),
      jobFailureReasonFromError(
        buildPythonExitError({
          code: 1,
          stdout: '',
          stderr: 'UserWarning: Field contained the following invalid HTML tags',
          jobId: 'j2',
        }),
        'j2'
      ),
      jobFailureReasonFromError(
        buildPythonExitError({
          code: 137,
          stdout: '',
          stderr: '',
          jobId: 'j3',
        }),
        'j3'
      ),
      jobFailureReasonFromError(new Error('mystery'), 'j4'),
      jobFailureReasonFromError('string error', 'j5'),
      jobFailureReasonFromError(undefined, 'j6'),
    ];
    for (const reason of reasons) {
      expect(reason).not.toMatch(/^Technical error/);
    }
  });
});
