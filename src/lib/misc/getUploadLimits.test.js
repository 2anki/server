"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getUploadLimits_1 = require("./getUploadLimits");
describe('getUploadLimits', () => {
    test('not patron', () => {
        const limits = (0, getUploadLimits_1.getUploadLimits)(false);
        const about100MB = 104857600;
        expect(limits.fileSize).toBe(about100MB);
    });
    test('paying', () => {
        const limits = (0, getUploadLimits_1.getUploadLimits)(true);
        const about1GB = 10485760000;
        expect(limits.fileSize).toBe(about1GB);
    });
});
//# sourceMappingURL=getUploadLimits.test.js.map