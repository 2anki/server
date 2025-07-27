import FallbackParser from './FallbackParser';

describe('FallbackParser.htmlToTextWithNewlines', () => {
  it('returns empty array and logs warning when html is undefined', () => {
    const parser = new FallbackParser([]);
    const spy = jest.spyOn(console, 'warn').mockImplementation();
    const result = parser.htmlToTextWithNewlines(undefined as any);
    expect(result).toEqual([]);
    expect(spy).toHaveBeenCalledWith(
      '[FallbackParser] htmlToTextWithNewlines called with invalid html:',
      undefined
    );
    spy.mockRestore();
  });

  it('returns empty array and logs warning when html is null', () => {
    const parser = new FallbackParser([]);
    const spy = jest.spyOn(console, 'warn').mockImplementation();
    const result = parser.htmlToTextWithNewlines(null as any);
    expect(result).toEqual([]);
    expect(spy).toHaveBeenCalledWith(
      '[FallbackParser] htmlToTextWithNewlines called with invalid html:',
      null
    );
    spy.mockRestore();
  });

  it('returns empty array and logs warning when html is empty string', () => {
    const parser = new FallbackParser([]);
    const spy = jest.spyOn(console, 'warn').mockImplementation();
    const result = parser.htmlToTextWithNewlines('');
    expect(result).toEqual([]);
    expect(spy).toHaveBeenCalledWith(
      '[FallbackParser] htmlToTextWithNewlines called with invalid html:',
      ''
    );
    spy.mockRestore();
  });

  it('parses simple ul/li html correctly', () => {
    const parser = new FallbackParser([]);
    const html = '<ul><li>Item 1</li><li>Item 2</li></ul>';
    const result = parser.htmlToTextWithNewlines(html);
    expect(result).toEqual(['• Item 1\n• Item 2\n']);
  });
});
