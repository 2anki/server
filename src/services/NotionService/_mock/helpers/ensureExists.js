"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ensureExists;
const fs_1 = __importDefault(require("fs"));
function ensureExists(location) {
    if (!fs_1.default.existsSync(location)) {
        console.info(`creating: ${location}`);
        fs_1.default.mkdirSync(location, { recursive: true });
    }
}
//# sourceMappingURL=ensureExists.js.map