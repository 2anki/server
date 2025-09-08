"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = dataMockPath;
const path_1 = __importDefault(require("path"));
const ensureExists_1 = __importDefault(require("./ensureExists"));
function dataMockPath(type, id) {
    const dir = path_1.default.join(__dirname, `../payloads/${type}`);
    (0, ensureExists_1.default)(dir);
    return path_1.default.join(dir, `${id}.json`);
}
//# sourceMappingURL=dataMockPath.js.map