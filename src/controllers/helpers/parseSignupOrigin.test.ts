import { parseSignupOrigin } from './parseSignupOrigin';

describe('parseSignupOrigin', () => {
  it.each([
    '/notion-to-anki',
    '/quizlet-to-anki',
    '/markdown-to-anki',
    '/pdf-to-anki',
  ])('accepts the landing path %s', (input) => {
    expect(parseSignupOrigin(input)).toBe(input);
  });

  it('returns null for empty string', () => {
    expect(parseSignupOrigin('')).toBeNull();
  });

  it('returns null for non-string input', () => {
    expect(parseSignupOrigin(undefined)).toBeNull();
    expect(parseSignupOrigin(null)).toBeNull();
    expect(parseSignupOrigin(123)).toBeNull();
    expect(parseSignupOrigin({})).toBeNull();
  });

  it('returns null when the value contains an HTML tag', () => {
    expect(parseSignupOrigin('<script>alert(1)</script>')).toBeNull();
  });

  it('returns null when the value lacks the leading slash', () => {
    expect(parseSignupOrigin('notion-to-anki')).toBeNull();
  });

  it('returns null when the value contains uppercase letters', () => {
    expect(parseSignupOrigin('/Notion-To-Anki')).toBeNull();
  });

  it('returns null when the value contains path separators after the first slash', () => {
    expect(parseSignupOrigin('/path/with/more')).toBeNull();
  });

  it('returns null when the value contains query strings', () => {
    expect(parseSignupOrigin('/notion-to-anki?evil=1')).toBeNull();
  });

  it('returns null when the slug exceeds 64 characters', () => {
    const oversized = '/' + 'a'.repeat(65);
    expect(parseSignupOrigin(oversized)).toBeNull();
  });

  it('accepts a slug at the 64-character boundary', () => {
    const boundary = '/' + 'a'.repeat(64);
    expect(parseSignupOrigin(boundary)).toBe(boundary);
  });
});
