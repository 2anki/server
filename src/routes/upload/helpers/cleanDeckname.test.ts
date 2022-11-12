import cleanDeckName from './cleanDeckname';

describe('cleanDeckname', () => {
  test('strips away emoji', () => {
    expect(cleanDeckName('😸 HTML test')).toBe('HTML test');
  });
});
