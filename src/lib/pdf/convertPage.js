"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertPage = convertPage;
const child_process_1 = require("child_process");
const os_1 = __importDefault(require("os"));
function convertPage(pdfPath, pageNumber, totalPageCount) {
    const outputFileNameBase = `${pdfPath}-page${pageNumber}`;
    const determinePaddingLength = (pageCount) => {
        if (pageCount >= 1000)
            return 4;
        if (pageCount >= 100)
            return 3;
        if (pageCount >= 10)
            return 2;
        return 1;
    };
    const paddedPageNumber = String(pageNumber).padStart(determinePaddingLength(totalPageCount), '0');
    const pdftoppmPath = os_1.default.platform() === 'darwin'
        ? '/usr/local/bin/pdftoppm'
        : '/usr/bin/pdftoppm';
    return new Promise((resolve, reject) => {
        const process = (0, child_process_1.spawn)(pdftoppmPath, [
            '-png',
            '-f',
            pageNumber.toString(),
            '-l',
            pageNumber.toString(),
            pdfPath,
            outputFileNameBase,
        ]);
        process.on('error', (error) => {
            reject(new Error(`Failed to convert page ${pageNumber} to PNG: ${error.message}`));
        });
        process.on('close', (code) => {
            if (code !== 0) {
                return reject(new Error(`pdftoppm process exited with code ${code}`));
            }
            resolve(`${outputFileNameBase}-${paddedPageNumber}.png`);
        });
    });
}
//# sourceMappingURL=convertPage.js.map