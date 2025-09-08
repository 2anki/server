"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
/**
 * We create a hash from the input to avoid name conflicts
 * and invalid characters due to language encoding.
 * @param input user supplied filename
 * @returns hex digest
 */
const getUniqueFileName = (input, max = 100) => {
    const shasum = crypto_1.default.createHash('sha512');
    shasum.update(input);
    return shasum.digest('hex').slice(0, max);
};
exports.default = getUniqueFileName;
//# sourceMappingURL=getUniqueFileName.js.map