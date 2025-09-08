"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getOwner_1 = require("./getOwner");
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.locals = { owner: 1 };
    return res;
};
describe('getOwner', () => {
    test('returns the owner from the response', () => {
        const result = (0, getOwner_1.getOwner)(mockResponse());
        expect(result).toEqual(1);
    });
    test('throws an error if the owner is not set', () => {
        expect((0, getOwner_1.getOwner)()).toBe(undefined);
    });
});
//# sourceMappingURL=getOwner.test.js.map