"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getPayload;
const fs_1 = __importDefault(require("fs"));
function getPayload(path) {
    return JSON.parse(fs_1.default.readFileSync(path).toString());
}
//# sourceMappingURL=getPayload.js.map