"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const constants_1 = require("../lib/constants");
const appInfo = JSON.parse(fs_1.default.readFileSync((0, constants_1.resolvePath)(__dirname, '../../package.json')).toString());
class VersionService {
    getVersion() {
        return `Notion to Anki v${appInfo.version}`;
    }
}
exports.default = VersionService;
//# sourceMappingURL=VersionService.js.map