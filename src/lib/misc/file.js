"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuffixFrom = SuffixFrom;
exports.S3FileName = S3FileName;
exports.BytesToMegaBytes = BytesToMegaBytes;
exports.FileSizeInMegaBytes = FileSizeInMegaBytes;
const fs_1 = __importDefault(require("fs"));
function SuffixFrom(input) {
    if (!input) {
        return null;
    }
    const m = input.match(/\.[0-9a-z]+$/i);
    if (!m) {
        return null;
    }
    return m[0];
}
function S3FileName(url) {
    const u = url.split('?')[0].split('/');
    return u[u.length - 1];
}
function BytesToMegaBytes(bytes) {
    return bytes / (1024 * 1024);
}
function FileSizeInMegaBytes(filePath) {
    const stats = fs_1.default.statSync(filePath);
    return BytesToMegaBytes(stats.size);
}
//# sourceMappingURL=file.js.map