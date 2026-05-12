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
  test('reversed number sorts after source card', () => {
    const note = new Note('this is the back', '🔄this is the front');
    note.number = 4;
    expect(note.reversed(note).number).toBe(4.5);
  });
});
