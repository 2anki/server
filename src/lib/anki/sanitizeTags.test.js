"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sanitizeTags_1 = __importDefault(require("./sanitizeTags"));
describe('sanitizeTags', () => {
    it.each([
        ['spaces are handled', ['this tag'], ['this-tag']],
        ['tabs are handled', ['\tthis tag'], ['this-tag']],
        ['newlines are handled', ['\nthis tag'], ['this-tag']],
        ['double spaces are handled', ['\nthis    tag'], ['this-tag']],
    ])('%s', (_, input, expected) => {
        expect((0, sanitizeTags_1.default)(input)).toEqual(expected);
    });
});
//# sourceMappingURL=sanitizeTags.test.js.map