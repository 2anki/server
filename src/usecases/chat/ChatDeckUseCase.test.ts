import { looksLikeCloze } from './ChatDeckUseCase';

describe('looksLikeCloze', () => {
  it('returns true for a single cloze marker', () => {
    expect(looksLikeCloze('Paris is the capital of {{c1::France}}')).toBe(true);
  });

  it('returns true for multi-digit cloze numbers', () => {
    expect(looksLikeCloze('{{c12::elephant}} memory')).toBe(true);
  });

  it('returns true when more than one cloze marker is present', () => {
    expect(
      looksLikeCloze('{{c1::mitochondria}} is the {{c2::powerhouse}} of the cell')
    ).toBe(true);
  });

  it('returns true when the marker is embedded in HTML', () => {
    expect(looksLikeCloze('<p>What is <b>{{c1::Paris}}</b>?</p>')).toBe(true);
  });

  it('returns false on plain Q/A text', () => {
    expect(looksLikeCloze('What is the capital of France?')).toBe(false);
  });

  it('returns false when only the opening braces are present', () => {
    expect(looksLikeCloze('Render {{ as braces}}')).toBe(false);
  });

  it('returns false when cloze marker has no digit', () => {
    expect(looksLikeCloze('{{c::Paris}} broken syntax')).toBe(false);
  });

  it('returns false on an empty string', () => {
    expect(looksLikeCloze('')).toBe(false);
  });
});
