import FallbackParser from './FallbackParser';

describe('FallbackParser.getMarkdownBulletLists', () => {
  it('should extract basic bullet points with - character', () => {
    const parser = new FallbackParser([]);
    const markdown = '- Item 1\n- Item 2\n- Item 3';
    const result = parser.getMarkdownBulletLists(markdown);
    expect(result).toEqual(['- Item 1', '- Item 2', '- Item 3']);
  });

  it('should extract basic bullet points with * character', () => {
    const parser = new FallbackParser([]);
    const markdown = '* Item 1\n* Item 2\n* Item 3';
    const result = parser.getMarkdownBulletLists(markdown);
    expect(result).toEqual(['* Item 1', '* Item 2', '* Item 3']);
  });

  it('should extract basic bullet points with + character', () => {
    const parser = new FallbackParser([]);
    const markdown = '+ Item 1\n+ Item 2\n+ Item 3';
    const result = parser.getMarkdownBulletLists(markdown);
    expect(result).toEqual(['+ Item 1', '+ Item 2', '+ Item 3']);
  });

  it('should extract bullet points with cloze deletion format using backticks and = separator', () => {
    const parser = new FallbackParser([]);
    const markdown = '- hübsch, schön = `bonito`';
    const result = parser.getMarkdownBulletLists(markdown);
    expect(result).toEqual(['- hübsch, schön = `bonito`']);
  });

  it('should extract bullet points with cloze deletion format using underscores and - separator', () => {
    const parser = new FallbackParser([]);
    const markdown = '- hübsch, schön - ___';
    const result = parser.getMarkdownBulletLists(markdown);
    expect(result).toEqual(['- hübsch, schön - ___']);
  });

  it('should extract bullet points with multiple spaces after the bullet character', () => {
    const parser = new FallbackParser([]);
    const markdown = '-  Item with two spaces\n-   Item with three spaces';
    const result = parser.getMarkdownBulletLists(markdown);
    expect(result).toEqual(['-  Item with two spaces', '-   Item with three spaces']);
  });

  it('should handle bullet points with minimal content', () => {
    const parser = new FallbackParser([]);
    const markdown = '- A\n- Item 2';
    const result = parser.getMarkdownBulletLists(markdown);
    expect(result).toEqual(['- A', '- Item 2']);
  });

  it('should handle bullet points within other text', () => {
    const parser = new FallbackParser([]);
    const markdown = 'Some text before\n- Item 1\n- Item 2\nSome text after';
    const result = parser.getMarkdownBulletLists(markdown);
    expect(result).toEqual(['- Item 1', '- Item 2']);
  });
});
