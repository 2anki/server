"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getDeckname_1 = __importDefault(require("./getDeckname"));
describe('getDeckname', () => {
    it('has no parent', () => {
        expect((0, getDeckname_1.default)('', 'test')).toBe('test');
    });
    it('has parent', () => {
        expect((0, getDeckname_1.default)('parent', 'test')).toBe('parent::test');
    });
    it('ignores parent is same as child', () => {
        expect((0, getDeckname_1.default)('test', 'test')).toBe('test');
    });
});
//# sourceMappingURL=getDeckname.test.js.map