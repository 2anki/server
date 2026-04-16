import {
  shouldShareFilesForDebugging,
  SHARE_FILES_FOR_DEBUGGING_KEY,
} from './shouldShareFilesForDebugging';

describe('shouldShareFilesForDebugging', () => {
  it('defaults to false when body is missing', () => {
    expect(shouldShareFilesForDebugging(undefined)).toBe(false);
    expect(shouldShareFilesForDebugging(null)).toBe(false);
  });

  it('defaults to false when the flag is absent', () => {
    expect(shouldShareFilesForDebugging({})).toBe(false);
    expect(shouldShareFilesForDebugging({ other: 'true' })).toBe(false);
  });

  it('returns true when flag is the string "true"', () => {
    expect(
      shouldShareFilesForDebugging({ [SHARE_FILES_FOR_DEBUGGING_KEY]: 'true' })
    ).toBe(true);
  });

  it('returns true when flag is boolean true', () => {
    expect(
      shouldShareFilesForDebugging({ [SHARE_FILES_FOR_DEBUGGING_KEY]: true })
    ).toBe(true);
  });

  it('returns false when flag is the string "false"', () => {
    expect(
      shouldShareFilesForDebugging({ [SHARE_FILES_FOR_DEBUGGING_KEY]: 'false' })
    ).toBe(false);
  });

  it('returns false for unexpected values', () => {
    expect(
      shouldShareFilesForDebugging({ [SHARE_FILES_FOR_DEBUGGING_KEY]: 'yes' })
    ).toBe(false);
    expect(
      shouldShareFilesForDebugging({ [SHARE_FILES_FOR_DEBUGGING_KEY]: 1 })
    ).toBe(false);
  });
});
