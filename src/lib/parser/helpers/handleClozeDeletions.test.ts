import handleClozeDeletions from './handleClozeDeletions';

describe('handleClozeDeletions', () => {
  it('should handle already formatted cloze deletions', () => {
    const input = '<p>The capital is <code>{{c1::Paris}}</code></p>';
    const expected = '<p>The capital is {{c1::Paris}}</p>';
    expect(handleClozeDeletions(input)).toBe(expected);
  });

  it('should handle missing braces', () => {
    const input = '<p>The capital is <code>c1::Paris</code></p>';
    const expected = '<p>The capital is {{c1::Paris}}</p>';
    expect(handleClozeDeletions(input)).toBe(expected);
  });

  it('should auto-number regular clozes after explicit ones', () => {
    const input = `
      <ul>
        <li>First point with <code>c1::explicit cloze</code></li>
        <li>Second point with <code>auto cloze</code></li>
        <li>Third point with <code>another auto cloze</code></li>
      </ul>
    `;
    const expected = `
      <ul>
        <li>First point with {{c1::explicit cloze}}</li>
        <li>Second point with {{c2::auto cloze}}</li>
        <li>Third point with {{c3::another auto cloze}}</li>
      </ul>
    `;
    expect(handleClozeDeletions(input)).toBe(expected);
  });

  it('should handle multiple explicit cloze numbers', () => {
    const input = `
      <p>
        <code>c2::Second</code> comes after <code>c1::First</code> and before <code>next</code>
      </p>
    `;
    const expected = `
      <p>
        {{c2::Second}} comes after {{c1::First}} and before {{c3::next}}
      </p>
    `;
    expect(handleClozeDeletions(input)).toBe(expected);
  });

  it('should handle KaTeX content', () => {
    const input = '<p>The formula is <code>KaTex:\\frac{1}{2}</code></p>';
    const expected = '<p>The formula is {{c1::\\frac{1}{2} }}</p>';
    expect(handleClozeDeletions(input)).toBe(expected);
  });

  it('should handle mixed KaTeX and regular clozes', () => {
    const input = `
      <p>
        <code>c1::First</code> then 
        <code>KaTex:\\frac{1}{2}</code> and 
        <code>regular text</code>
      </p>
    `;
    const expected = `
      <p>
        {{c1::First}} then 
        {{c2::\\frac{1}{2}}} and 
        {{c3::regular text}}
      </p>
    `;
    expect(handleClozeDeletions(input)).toBe(expected);
  });

  it('should handle nested cloze deletions with same number in summary', () => {
    const input =
      '<details><summary><code>c1::Good habits</code> are <code>c1::good</code> in general</summary></details>';
    const expected =
      '<details><summary>{{c1::Good habits}} are {{c1::good}} in general</summary></details>';
    expect(handleClozeDeletions(input)).toBe(expected);
  });

  it('should preserve existing nested cloze deletions in summary', () => {
    const input =
      '<details><summary><code>{{c1::Good}} things happen for {{c1::good}}</code> people</summary></details>';
    const expected =
      '<details><summary>{{c1::Good}} things happen for {{c1::good}} people</summary></details>';
    expect(handleClozeDeletions(input)).toBe(expected);
  });

  it('should handle empty details with summary', () => {
    const input = '<details><summary>Some text</summary></details>';
    const expected = '<details><summary>Some text</summary></details>';
    expect(handleClozeDeletions(input)).toBe(expected);
  });
});
