"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getBlockId_1 = __importDefault(require("./getBlockId"));
describe('getBlockId', () => {
    test('should return the block id', () => {
        expect((0, getBlockId_1.default)({
            object: 'block',
            id: '1590db54-99fe-467c-a656-be319fe6ca8b',
        })).toBe('1590db5499fe467ca656be319fe6ca8b');
    });
});
//# sourceMappingURL=getBlockId.test.js.map