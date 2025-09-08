"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockDataExists = mockDataExists;
const fs_1 = __importDefault(require("fs"));
const dataMockPath_1 = __importDefault(require("./dataMockPath"));
function mockDataExists(type, id) {
    const path = (0, dataMockPath_1.default)(type, id);
    return fs_1.default.existsSync(path);
}
//# sourceMappingURL=mockDataExists.js.map