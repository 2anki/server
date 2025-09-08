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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZipHandler = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const fflate_1 = require("fflate");
const server_1 = require("react-dom/server");
const getUploadLimits_1 = require("../misc/getUploadLimits");
const checks_1 = require("../storage/checks");
const processAndPrepareArchiveData_1 = require("./fallback/processAndPrepareArchiveData");
const getRandomUUID_1 = require("../../shared/helpers/getRandomUUID");
const convertImageToHTML_1 = require("../../infrastracture/adapters/fileConversion/convertImageToHTML");
class ZipHandler {
    constructor(maxNestedZipFiles) {
        this.files = [];
        this.zipFileCount = 0;
        this.maxZipFiles = maxNestedZipFiles;
        this.combinedHTML = '';
    }
    build(zipData, paying, settings) {
        return __awaiter(this, void 0, void 0, function* () {
            const size = Buffer.byteLength(zipData);
            const limits = (0, getUploadLimits_1.getUploadLimits)(paying);
            if (size > limits.fileSize) {
                throw new Error((0, server_1.renderToStaticMarkup)((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: ["Your upload is too big, there is a max of ", size, " / $", limits.fileSize, " currently.", ' ', (0, jsx_runtime_1.jsx)("a", { href: "https://alemayhu.com/patreon", children: "Become a patron" }), " to remove default limit."] })));
            }
            yield this.processZip(zipData, paying, settings);
        });
    }
    processZip(zipData, paying, settings) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.zipFileCount >= this.maxZipFiles) {
                throw new Error('Too many zip files in the upload.');
            }
            try {
                const loadedZip = (0, fflate_1.unzipSync)(zipData, {
                    filter: (file) => !(0, checks_1.isHiddenFileOrDirectory)(file.name),
                });
                let noSuffixCount = 0;
                const totalFiles = Object.keys(loadedZip).length;
                for (const name in loadedZip) {
                    const file = loadedZip[name];
                    if (!name.includes('.')) {
                        noSuffixCount++;
                    }
                    yield this.handleFile(name, file, paying, settings);
                }
                if (noSuffixCount === totalFiles) {
                    throw new Error('The zip file contains only files with no suffix. Supported file types are: .zip, .html, .csv, .md, .pdf, .ppt, and .pptx.');
                }
                this.addCombinedHTMLToFiles(paying, settings);
            }
            catch (error) {
                yield this.handleZipError(error, zipData, paying);
            }
        });
    }
    handleFile(name, file, paying, settings) {
        return __awaiter(this, void 0, void 0, function* () {
            if (name.includes('__MACOSX/'))
                return;
            if (name.endsWith('.zip')) {
                this.zipFileCount++;
                yield this.processZip(file, paying, settings);
            }
            else if ((0, checks_1.isHTMLFile)(name) || (0, checks_1.isMarkdownFile)(name)) {
                this.files.push({ name, contents: (0, fflate_1.strFromU8)(file) });
            }
            else if (paying && settings.imageQuizHtmlToAnki && (0, checks_1.isImageFile)(name)) {
                yield this.convertAndAddImageToHTML(name, file);
            }
            else if ((0, checks_1.isPDFFile)(name) && settings.processPDFs === false) {
                // Skip PDF processing when processPDFs is false
                return;
            }
            else {
                this.files.push({ name, contents: file });
            }
        });
    }
    convertAndAddImageToHTML(name, file) {
        return __awaiter(this, void 0, void 0, function* () {
            const html = yield (0, convertImageToHTML_1.convertImageToHTML)(Buffer.from(file).toString('base64'));
            this.combinedHTML += html;
            console.log('Converted image to HTML:', name, html);
        });
    }
    addCombinedHTMLToFiles(paying, settings) {
        var _a;
        if (this.combinedHTML && paying) {
            const finalHTML = `<!DOCTYPE html>
<html>
<head><title>${(_a = settings.deckName) !== null && _a !== void 0 ? _a : 'Image Quiz'}</title></head>
<body>
${this.combinedHTML}
</body>
</html>`;
            this.files.push({
                name: `ocr-${(0, getRandomUUID_1.getRandomUUID)()}.html`,
                contents: finalHTML,
            });
        }
    }
    handleZipError(error, zipData, paying) {
        return __awaiter(this, void 0, void 0, function* () {
            const isArchiveProcessingError = error.code === 13;
            if (isArchiveProcessingError) {
                const foundFiles = yield (0, processAndPrepareArchiveData_1.processAndPrepareArchiveData)(zipData, paying);
                this.files.push(...foundFiles);
                console.log('Processed files using fallback method:');
            }
            else {
                throw error;
            }
        });
    }
    getFileNames() {
        return this.files.map((file) => file.name);
    }
}
exports.ZipHandler = ZipHandler;
//# sourceMappingURL=zip.js.map