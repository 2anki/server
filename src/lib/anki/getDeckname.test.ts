import getDeckName from './getDeckname';

describe('getDeckname', () => {
  it('has no parent', () => {
    expect(getDeckName('', 'test')).toBe('test');
  });
  it('has parent', () => {
    expect(getDeckName('parent', 'test')).toBe('parent::test');
  });
  it('ignores parent is same as child', () => {
    expect(getDeckName('test', 'test')).toBe('test');
  });
});
