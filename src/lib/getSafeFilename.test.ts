import { getSafeFilename } from './getSafeFilename';

test('returns filename without slashes', () => {
  expect(getSafeFilename('x/y/z')).toBe('x-y-z');
});
