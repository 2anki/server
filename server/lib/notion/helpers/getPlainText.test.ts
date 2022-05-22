import getPlainText from './getPlainText';

describe('getPlainText', () => {
  test('should return empty string if text is empty', () => {
    expect(getPlainText([])).toBe('');
  });

  test('joins multiple text blocks', () => {
    expect(getPlainText([{ plain_text: '21' }, { plain_text: '21' }])).toBe('21<br>21');
  });
});
