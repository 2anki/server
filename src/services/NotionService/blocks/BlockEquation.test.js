"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BlockEquation_1 = __importDefault(require("./BlockEquation"));
describe('BlockEquation', () => {
    test('MathJax transform', () => {
        const expected = '\\(\\sqrt{x}\\)';
        const input = {
            object: 'block',
            id: 'be5503f9-7544-460d-a500-fdc3c04431e8',
            parent: {
                type: 'block_id',
                block_id: '0d75beab-5fbe-46b3-aeaa-bc64e765bb41',
            },
            created_time: '2022-12-25T19:32:00.000Z',
            last_edited_time: '2022-12-25T19:32:00.000Z',
            created_by: {
                object: 'user',
                id: 'aa',
            },
            last_edited_by: {
                object: 'user',
                id: 'aa',
            },
            has_children: false,
            archived: false,
            type: 'equation',
            equation: { expression: '\\sqrt{x}' },
        };
        expect((0, BlockEquation_1.default)(input)).toBe(expected);
    });
});
//# sourceMappingURL=BlockEquation.test.js.map