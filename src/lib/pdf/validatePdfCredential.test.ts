import { validatePdfCredential } from './validatePdfCredential';

describe('validatePdfCredential', () => {
  it('returns trimmed string for a valid credential', () => {
    expect(validatePdfCredential('  secret123  ')).toBe('secret123');
  });

  it('returns the credential unchanged when no surrounding whitespace', () => {
    expect(validatePdfCredential('correct-horse-battery-staple')).toBe(
      'correct-horse-battery-staple'
    );
  });

  it('returns null for non-string input', () => {
    expect(validatePdfCredential(null)).toBeNull();
    expect(validatePdfCredential(undefined)).toBeNull();
    expect(validatePdfCredential(42)).toBeNull();
  });

  it('returns null for empty string after trimming', () => {
    expect(validatePdfCredential('')).toBeNull();
    expect(validatePdfCredential('   ')).toBeNull();
  });

  it('returns null for credential exceeding 100 chars', () => {
    expect(validatePdfCredential('a'.repeat(101))).toBeNull();
    expect(validatePdfCredential('a'.repeat(100))).toBe('a'.repeat(100));
  });

  it('returns null when credential contains a null byte', () => {
    expect(validatePdfCredential('pass\x00word')).toBeNull();
  });

  it('returns null when credential contains a newline', () => {
    expect(validatePdfCredential('pass\nword')).toBeNull();
    expect(validatePdfCredential('pass\rword')).toBeNull();
  });

  it('returns null when credential contains a tab', () => {
    expect(validatePdfCredential('pass\tword')).toBeNull();
  });
});
