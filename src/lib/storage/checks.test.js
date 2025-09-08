"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const checks_1 = require("./checks");
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
    expect((0, checks_1.hasMarkdownFileName)([FILE_MD, FILE_TXT])).toBe(true);
    expect((0, checks_1.hasMarkdownFileName)([FILE_MD_UPPER])).toBe(true);
});
test('hasMarkdownFileName returns false', () => {
    expect((0, checks_1.hasMarkdownFileName)([FILE_TXT, FILE_TXT])).toBe(false);
});
test('isCompressedFile identifies compressed files', () => {
    expect((0, checks_1.isCompressedFile)(NO_EXTENSION)).toBe(true);
    expect((0, checks_1.isCompressedFile)(ENDS_WITH_PERIOD)).toBe(true);
    expect((0, checks_1.isCompressedFile)(HAS_EXTENSION_ZIP)).toBe(true); // Now returns true due to the new implementation
    expect((0, checks_1.isCompressedFile)(HAS_EXTENSION_Z)).toBe(true); // Also returns true for .z files
    expect((0, checks_1.isCompressedFile)(HAS_EXTENSION_TXT)).toBe(false);
    expect((0, checks_1.isCompressedFile)(HAS_EXTENSION_TAR_GZ)).toBe(false);
    expect((0, checks_1.isCompressedFile)(ENDS_WITH_DOUBLE_PERIOD)).toBe(true);
});
test('isCompressedFile handles undefined input gracefully', () => {
    expect((0, checks_1.isCompressedFile)(undefined)).toBe(false);
    expect((0, checks_1.isCompressedFile)(null)).toBe(false);
    expect((0, checks_1.isCompressedFile)('')).toBe(false);
});
//# sourceMappingURL=checks.test.js.map