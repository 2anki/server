"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const parseTemplate_1 = require("./parseTemplate");
test('loads valid JSON', () => {
    const input = fs_1.default
        .readFileSync(path_1.default.join(__dirname, '../../../../templates/n2a-basic.json'))
        .toString();
    const template = (0, parseTemplate_1.parseTemplate)(input);
    expect(template.name).toBe('n2a-basic');
});
test('return undefined', () => {
    expect((0, parseTemplate_1.parseTemplate)(undefined)).toBeUndefined();
});
//# sourceMappingURL=parseTemplate.test.js.map