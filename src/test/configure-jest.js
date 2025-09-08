"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupTests = void 0;
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const setupTests = () => {
    process.env.WORKSPACE_BASE = path_1.default.join(os_1.default.tmpdir(), 'workspaces');
    jest.spyOn(console, 'log').mockImplementation(() => { });
    jest.spyOn(console, 'time').mockImplementation(() => { });
    jest.spyOn(console, 'debug').mockImplementation(() => { });
    jest.spyOn(console, 'error').mockImplementation(() => { });
    jest.spyOn(console, 'warn').mockImplementation(() => { });
};
exports.setupTests = setupTests;
//# sourceMappingURL=configure-jest.js.map