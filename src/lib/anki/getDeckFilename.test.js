"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Package_1 = __importDefault(require("../parser/Package"));
const getDeckFilename_1 = __importDefault(require("./getDeckFilename"));
test('appends missing .apkg extension', () => {
    expect((0, getDeckFilename_1.default)('foo')).toEqual('foo.apkg');
});
test("does not append .apkg extension if it's already there", () => {
    expect((0, getDeckFilename_1.default)('foo.apkg')).toEqual('foo.apkg');
});
test("uses package name if it's available", () => {
    expect((0, getDeckFilename_1.default)(new Package_1.default('foo'))).toEqual('foo.apkg');
});
//# sourceMappingURL=getDeckFilename.test.js.map