"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addHeadings_1 = __importDefault(require("./addHeadings"));
describe('addHeadings', () => {
    test('should add headings to the array', () => {
        expect((0, addHeadings_1.default)(['heading'])).toEqual([
            'heading_1',
            'heading_2',
            'heading_3',
        ]);
    });
    test('should not add headings', () => {
        expect((0, addHeadings_1.default)(['page'])).toEqual(['page']);
    });
});
//# sourceMappingURL=addHeadings.test.js.map