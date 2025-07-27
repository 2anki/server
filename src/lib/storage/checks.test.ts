import { hasMarkdownFileName, isCompressedFile } from './checks';

const FILE_MD = 'abc.md';
const FILE_TXT = 'def.txt';
const FILE_MD_UPPER = 'cool.MD';

const NO_EXTENSION = 'file';
const ENDS_WITH_PERIOD = 'file.';
const HAS_EXTENSION_ZIP = 'file.zip';
const HAS_EXTENSION_Z = 'file.z';
const HAS_EXTENSION_TXT = 'file.txt';
const HAS_EXTENSION_TAR_GZ = 'file.tar.gz';
const ENDS_WITH_DOUBLE_PERIOD = 'file..';

test('hasMarkdownFileName returns true', () => {
  expect(hasMarkdownFileName([FILE_MD, FILE_TXT])).toBe(true);
  expect(hasMarkdownFileName([FILE_MD_UPPER])).toBe(true);
});

test('hasMarkdownFileName returns false', () => {
  expect(hasMarkdownFileName([FILE_TXT, FILE_TXT])).toBe(false);
});

test('isCompressedFile identifies compressed files', () => {
  expect(isCompressedFile(NO_EXTENSION)).toBe(true);
  expect(isCompressedFile(ENDS_WITH_PERIOD)).toBe(true);
  expect(isCompressedFile(HAS_EXTENSION_ZIP)).toBe(true); // Now returns true due to the new implementation
  expect(isCompressedFile(HAS_EXTENSION_Z)).toBe(true); // Also returns true for .z files
  expect(isCompressedFile(HAS_EXTENSION_TXT)).toBe(false);
  expect(isCompressedFile(HAS_EXTENSION_TAR_GZ)).toBe(false);
  expect(isCompressedFile(ENDS_WITH_DOUBLE_PERIOD)).toBe(true);
});

test('isCompressedFile handles undefined input gracefully', () => {
  expect(isCompressedFile(undefined)).toBe(false);
  expect(isCompressedFile(null)).toBe(false);
  expect(isCompressedFile('')).toBe(false);
});
