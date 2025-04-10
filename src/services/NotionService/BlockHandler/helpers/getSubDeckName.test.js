"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getSubDeckName_1 = __importDefault(require("./getSubDeckName"));
const mocks_1 = require("./mocks");
describe('getSubDeckName', () => {
    it.each([
        ['name from title', { title: 'cool' }, 'cool'],
        ['child page', mocks_1.CHILD_PAGE_MOCK, 'Basic blocks'],
        ['child page', mocks_1.HEADING_MOCK, 'Blocks'],
    ])('%s', (_, input, expected) => {
        expect((0, getSubDeckName_1.default)(input)).toBe(expected);
    });
});
//# sourceMappingURL=getSubDeckName.test.js.map