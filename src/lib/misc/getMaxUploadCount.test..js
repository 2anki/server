"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getMaxUploadCount_1 = require("./getMaxUploadCount");
describe('getMaxUploadCount', () => {
    it('should return 21 for anon', () => {
        expect((0, getMaxUploadCount_1.getMaxUploadCount)()).toBe(1);
    });
    it('should return the 10x for subscribers and patrons', () => {
        expect((0, getMaxUploadCount_1.getMaxUploadCount)(true)).toBe(2100);
    });
});
//# sourceMappingURL=getMaxUploadCount.test..js.map