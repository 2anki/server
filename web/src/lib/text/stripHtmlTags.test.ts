import { stripHtmlTags } from './stripHtmlTags';

describe('stripHtmlTags', () => {
  test('returns plain text unchanged', () => {
    expect(stripHtmlTags('No active subscription.')).toBe(
      'No active subscription.'
    );
  });

  test('strips simple HTML tags', () => {
    expect(
      stripHtmlTags('<p>Could not create a deck using your file</p>')
    ).toBe('Could not create a deck using your file');
  });

  test('strips nested HTML tags', () => {
    expect(
      stripHtmlTags(
        '<div class="info">Could not create a deck using your file(s) and rules. Make sure to at least create on valid toggle or verify your <a href="/upload?view=template">settings</a>.</div>'
      )
    ).toBe(
      'Could not create a deck using your file(s) and rules. Make sure to at least create on valid toggle or verify your settings.'
    );
  });

  test('collapses extra whitespace from stripped markup', () => {
    expect(stripHtmlTags('<p>  Hello   world  </p>')).toBe('Hello world');
  });

  test('handles self-closing tags', () => {
    expect(stripHtmlTags('Line one<br />Line two')).toBe('Line one Line two');
  });

  test('returns empty string for empty input', () => {
    expect(stripHtmlTags('')).toBe('');
  });

  test('handles string with only tags and no text', () => {
    expect(stripHtmlTags('<div><br/></div>')).toBe('');
  });
});
