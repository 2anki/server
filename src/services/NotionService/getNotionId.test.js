"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getNotionId_1 = require("./getNotionId");
describe('getNotionId', () => {
    it('should be able to identify a GetNotionID', () => {
        expect((0, getNotionId_1.getNotionId)('https://www.notion.so/alemayhu/HTML-test-4aa53621a84a4660b69e9953f3938685')).toBe('4aa53621a84a4660b69e9953f3938685');
    });
    it('should be undefined', () => {
        expect((0, getNotionId_1.getNotionId)('')).toBe(undefined);
    });
});
//# sourceMappingURL=getNotionId.test.js.map