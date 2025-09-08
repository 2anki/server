"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getPlainText_1 = __importDefault(require("./getPlainText"));
describe('getPlainText', () => {
    test('should return empty string if text is empty', () => {
        expect((0, getPlainText_1.default)([])).toBe('');
    });
    test('joins multiple text blocks', () => {
        expect((0, getPlainText_1.default)([{ plain_text: '21' }, { plain_text: '21' }])).toBe('21<br>21');
    });
});
//# sourceMappingURL=getPlainText.test.js.map