"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getSafeFilename_1 = require("./getSafeFilename");
test('returns filename without slashes', () => {
    expect((0, getSafeFilename_1.getSafeFilename)('x/y/z')).toBe('x-y-z');
});
//# sourceMappingURL=getSafeFilename.test.js.map