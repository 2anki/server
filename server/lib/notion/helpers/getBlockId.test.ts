import getBlockId from './getBlockId';

describe('getBlockId', () => {
  test('should return the block id', () => {
    expect(
      getBlockId({ object: 'block', id: '1590db54-99fe-467c-a656-be319fe6ca8b' })
    ).toBe('1590db5499fe467ca656be319fe6ca8b');
  });
});
