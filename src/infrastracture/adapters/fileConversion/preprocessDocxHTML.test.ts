import { preprocessDocxHTML } from './preprocessDocxHTML';

describe('preprocessDocxHTML', () => {
  it('converts multiple-choice questions with asterisk-marked answers to toggles', () => {
    const input = '<ol><li>Which leads to edema?<br />*A. blockage of lymphatic vessels<br />B. taking an antihistamine drug<br />C. A decrease in tissue fluid<br />D. All of the above</li></ol>';

    const result = preprocessDocxHTML(input);

    expect(result).toContain('<details>');
    expect(result).toContain('<summary>');
    expect(result).toContain('Which leads to edema?');
    expect(result).toContain('A. blockage of lymphatic vessels');
    expect(result).not.toContain('*A.');
  });

  it('puts the correct answer on the back of the card', () => {
    const input = '<ol><li>What color is the sky?<br />A. red<br />*B. blue<br />C. green</li></ol>';

    const result = preprocessDocxHTML(input);

    expect(result).toContain('<summary>');
    expect(result).toContain('What color is the sky?');
    expect(result).toContain('<strong>B. blue</strong>');
  });

  it('handles True/False questions', () => {
    const input = '<ol><li>Tonsils contain lymphocytes.<br />*A. True<br />B. False</li></ol>';

    const result = preprocessDocxHTML(input);

    expect(result).toContain('<summary>');
    expect(result).toContain('Tonsils contain lymphocytes.');
    expect(result).toContain('<strong>A. True</strong>');
  });

  it('handles multiple list items', () => {
    const input = '<ol><li>Q1?<br />*A. yes<br />B. no</li><li>Q2?<br />A. maybe<br />*B. sure</li></ol>';

    const result = preprocessDocxHTML(input);

    const toggleCount = (result.match(/<details>/g) || []).length;
    expect(toggleCount).toBe(2);
  });

  it('returns non-question HTML unchanged', () => {
    const input = '<p>Just a paragraph of text.</p>';

    const result = preprocessDocxHTML(input);

    expect(result).toBe(input);
  });

  it('preserves list items without asterisk markers as normal lists', () => {
    const input = '<ol><li>Define osmosis.</li></ol>';

    const result = preprocessDocxHTML(input);

    expect(result).not.toContain('<details>');
    expect(result).toContain('Define osmosis.');
  });

  it('handles questions where answer options use line breaks within li', () => {
    const input = '<ol><li>Cell-mediated immunity involves mostly<br />*A. T cells<br />B. B cells<br />C. Antibodies<br />D. Natural Killer cells</li></ol>';

    const result = preprocessDocxHTML(input);

    expect(result).toContain('Cell-mediated immunity involves mostly');
    expect(result).toContain('<strong>A. T cells</strong>');
  });
});
