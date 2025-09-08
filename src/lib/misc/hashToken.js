"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = hashToken;
const crypto_js_1 = __importDefault(require("crypto-js"));
function hashToken(token) {
    return crypto_js_1.default.AES.encrypt(token, process.env.THE_HASHING_SECRET).toString();
}
//# sourceMappingURL=hashToken.js.map