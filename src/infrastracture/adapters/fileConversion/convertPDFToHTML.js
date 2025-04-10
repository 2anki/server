"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertPDFToHTML = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const contentGenerationUtils_1 = require("./contentGenerationUtils");
const convertPDFToHTML = (pdf) => {
    const document1 = {
        inlineData: {
            mimeType: 'application/pdf',
            data: pdf,
        },
    };
    const text1 = {
        text: fs_1.default
            .readFileSync(path_1.default.join(__dirname, '../../../../../../pdf-to-html-api', 'instructions.txt'))
            .toString(),
    };
    const req = {
        contents: [{ role: 'user', parts: [document1, text1] }],
    };
    return (0, contentGenerationUtils_1.generateContent)(req);
};
exports.convertPDFToHTML = convertPDFToHTML;
//# sourceMappingURL=convertPDFToHTML.js.map