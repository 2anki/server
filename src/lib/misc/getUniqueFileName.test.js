"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getUniqueFileName_1 = __importDefault(require("./getUniqueFileName"));
describe('getUniqueFileName', () => {
    test('default max is less than 101 characters', () => {
        expect((0, getUniqueFileName_1.default)('my image.jpg').length).toBeLessThan(101);
    });
});
//# sourceMappingURL=getUniqueFileName.test.js.map