import getUniqueFileName from './getUniqueFileName';

describe('getUniqueFileName', () => {
  test('default max is less than 101 characters', () => {
    expect(getUniqueFileName('my image.jpg').length).toBeLessThan(101);
  });
});
