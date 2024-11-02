import cheerio from 'cheerio';
import { extractStyles } from './extractStyles';

describe('extractStyles', () => {
  it('should remove list-style-type changes', () => {
    const page = cheerio.load(`
 <style>.toggle {
\tpadding-inline-start: 0em;
\tlist-style-type: none;
}</style>
 `);

    const result = extractStyles(page);
    expect(result?.trim()).toEqual(
      `.toggle {
\tpadding-inline-start: 0em;
\t
}`.trim()
    );
  });

  it('should remove white-space: pre-wrap', () => {
    const page = cheerio.load(`
  <style>.toggle {
\tpadding-inline-start: 0em;
\twhite-space: pre-wrap;
}</style>`);
    const result = extractStyles(page);
    expect(result?.trim()).toEqual(
      `.toggle {
\tpadding-inline-start: 0em;
\t
}`.trim()
    );
  });
});
