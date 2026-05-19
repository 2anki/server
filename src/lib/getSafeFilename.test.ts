import { getSafeFilename } from './getSafeFilename';

test('returns filename without slashes', () => {
  expect(getSafeFilename('x/y/z')).toBe('x-y-z');
});

test('replaces backslashes with dashes', () => {
  expect(getSafeFilename('x\\y\\z')).toBe('x-y-z');
});

test('replaces null bytes with dashes', () => {
  expect(getSafeFilename('x\0y')).toBe('x-y');
});
