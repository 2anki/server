import { hasMarkdownFileName, isPotentialZipFile } from './checks';

const FILE_MD = 'abc.md';
const FILE_TXT = 'def.txt';
const FILE_MD_UPPER = 'cool.MD';

const NO_EXTENSION = 'file';
const ENDS_WITH_PERIOD = 'file.';
const HAS_EXTENSION_ZIP = 'file.zip';
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

test('isPotentialZipFile identifies potential zip files', () => {
  expect(isPotentialZipFile(NO_EXTENSION)).toBe(true);
  expect(isPotentialZipFile(ENDS_WITH_PERIOD)).toBe(true);
  expect(isPotentialZipFile(HAS_EXTENSION_ZIP)).toBe(false);
  expect(isPotentialZipFile(HAS_EXTENSION_TXT)).toBe(false);
  expect(isPotentialZipFile(HAS_EXTENSION_TAR_GZ)).toBe(false);
  expect(isPotentialZipFile(ENDS_WITH_DOUBLE_PERIOD)).toBe(true);
});

test('isPotentialZipFile handles undefined input gracefully', () => {
  expect(isPotentialZipFile(undefined)).toBe(false);
  expect(isPotentialZipFile(null)).toBe(false);
  expect(isPotentialZipFile('')).toBe(false);
});
