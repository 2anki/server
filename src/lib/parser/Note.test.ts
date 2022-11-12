import Note from './Note';

describe('Note', () => {
  test('refresh emoji', () => {
    const note = new Note('🔄This is the back', 'this is the front');
    expect(note.hasRefreshIcon()).toBe(true);
  });
  test('reverse', () => {
    const note = new Note('this is the back', '🔄this is the front');
    expect(note.reversed(note).name).toBe('🔄this is the front');
  });
  test('reversed number is negative', () => {
    const note = new Note('this is the back', '🔄this is the front');
    expect(note.reversed(note).number).toBe(-1);
  });
});
