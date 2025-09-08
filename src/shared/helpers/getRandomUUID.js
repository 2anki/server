"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRandomUUID = void 0;
const crypto_1 = __importDefault(require("crypto"));
const getRandomUUID = () => crypto_1.default.randomUUID();
exports.getRandomUUID = getRandomUUID;
//# sourceMappingURL=getRandomUUID.js.map