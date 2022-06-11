import notionColorToHex, { isNotionColorBackground } from './NotionColors';

describe('color mappings', () => {
  test('it converts text', () => {
    const color = notionColorToHex('red');
    expect(color).toBe('#E03E3E');
  });

  test('it converts background', () => {
    const color = notionColorToHex('red_background');
    expect(color).toBe('#E03E3E');
  });

  test('it is background', () => {
    expect(isNotionColorBackground('red_background')).toBe(true);
  });
});
