"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Note_1 = __importDefault(require("./Note"));
describe('Note', () => {
    test('refresh emoji', () => {
        const note = new Note_1.default('🔄This is the back', 'this is the front');
        expect(note.hasRefreshIcon()).toBe(true);
    });
    test('reverse', () => {
        const note = new Note_1.default('this is the back', '🔄this is the front');
        expect(note.reversed(note).name).toBe('🔄this is the front');
    });
    test('reversed number is negative', () => {
        const note = new Note_1.default('this is the back', '🔄this is the front');
        expect(note.reversed(note).number).toBe(-1);
    });
});
//# sourceMappingURL=Note.test.js.map