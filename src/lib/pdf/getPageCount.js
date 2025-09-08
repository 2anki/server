"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPageCount = getPageCount;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
function getPageCount(pdfPath) {
    return new Promise((resolve, reject) => {
        const pdfinfoBin = process.platform === 'darwin'
            ? '/usr/local/bin/pdfinfo'
            : '/usr/bin/pdfinfo';
        const pdfinfoProcess = (0, child_process_1.spawn)(pdfinfoBin, [pdfPath]);
        let stdout = '';
        let stderr = '';
        pdfinfoProcess.stdout.on('data', (data) => {
            stdout += data;
        });
        pdfinfoProcess.stderr.on('data', (data) => {
            stderr += data;
        });
        pdfinfoProcess.on('close', (code) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const pdfDir = path_1.default.dirname(pdfPath);
            const pdfBaseName = path_1.default.basename(pdfPath, path_1.default.extname(pdfPath));
            yield promises_1.default.writeFile(path_1.default.join(pdfDir, `${pdfBaseName}_stdout.log`), stdout);
            yield promises_1.default.writeFile(path_1.default.join(pdfDir, `${pdfBaseName}_stderr.log`), stderr);
            if (code !== 0) {
                // Check if the error is due to a password-protected PDF
                if (stderr.includes('Encrypted') || stderr.includes('password')) {
                    reject(new Error('The PDF file is password-protected. Please remove the password protection and try again, or you can turn off PDF processing by unchecking "Process PDF Files" in the settings to skip PDF processing of ZIP files containing PDFs.'));
                    return;
                }
                reject(new Error('Failed to execute pdfinfo'));
                return;
            }
            const pageCount = parseInt((_b = (_a = stdout
                .split('\n')
                .find((line) => line.startsWith('Pages:'))) === null || _a === void 0 ? void 0 : _a.split(/\s+/)[1]) !== null && _b !== void 0 ? _b : '0');
            if (!pageCount) {
                reject(new Error('Failed to get page count'));
                return;
            }
            resolve(pageCount);
        }));
    });
}
//# sourceMappingURL=getPageCount.js.map