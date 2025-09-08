"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const get16DigitRandomId = () => {
    let randomNumber;
    do {
        randomNumber = parseInt(crypto_1.default.randomBytes(8).toString('hex'), 16);
    } while (randomNumber > Number.MAX_SAFE_INTEGER);
    return randomNumber;
};
exports.default = get16DigitRandomId;
//# sourceMappingURL=get16DigitRandomId.js.map