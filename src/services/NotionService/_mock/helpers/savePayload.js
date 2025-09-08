"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = savePayload;
const fs_1 = __importDefault(require("fs"));
function savePayload(location, payload) {
    fs_1.default.writeFileSync(location, JSON.stringify(payload, null, 4));
}
//# sourceMappingURL=savePayload.js.map