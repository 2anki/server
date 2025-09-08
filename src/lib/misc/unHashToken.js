"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = unHashToken;
const crypto_js_1 = __importDefault(require("crypto-js"));
function unHashToken(hashed) {
    return crypto_js_1.default.AES.decrypt(hashed, process.env.THE_HASHING_SECRET).toString(crypto_js_1.default.enc.Utf8);
}
//# sourceMappingURL=unHashToken.js.map