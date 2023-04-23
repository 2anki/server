import { hasMarkdownFileName } from './checks';

test('hasMarkdownFileName returns true', () => {
  expect(hasMarkdownFileName(['abc.md', 'def.txt'])).toBe(true);
  expect(hasMarkdownFileName(['cool.MD'])).toBe(true);
});

test('hasMarkdownFileName returns false', () => {
  expect(hasMarkdownFileName(['abc.txt', 'def.txt'])).toBe(false);
});
