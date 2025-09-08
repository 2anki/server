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
exports.PDF_EXCEEDS_MAX_PAGE_LIMIT = void 0;
exports.convertPDFToImages = convertPDFToImages;
const promises_1 = require("fs/promises");
const path_1 = __importDefault(require("path"));
const getPageCount_1 = require("../../../lib/pdf/getPageCount");
const convertPage_1 = require("../../../lib/pdf/convertPage");
const combineIntoHTML_1 = require("../../../lib/pdf/combineIntoHTML");
const fs_1 = require("fs");
exports.PDF_EXCEEDS_MAX_PAGE_LIMIT = 'PDF exceeds maximum page limit of 100 for free and anonymous users.';
function convertPDFToImages(input) {
    return __awaiter(this, void 0, void 0, function* () {
        const { contents, workspace, noLimits, name, settings } = input;
        // Skip PDF processing if the option is disabled
        if ((settings === null || settings === void 0 ? void 0 : settings.processPDFs) === false) {
            return '';
        }
        const fileName = name
            ? path_1.default.basename(name).replace(/\.pptx?$/i, '.pdf')
            : 'Default.pdf';
        const pdfPath = path_1.default.join(workspace.location, fileName);
        if (!(0, fs_1.existsSync)(pdfPath)) {
            yield (0, promises_1.writeFile)(pdfPath, Buffer.from(contents));
        }
        const pageCount = yield (0, getPageCount_1.getPageCount)(pdfPath);
        const title = path_1.default.basename(pdfPath);
        if (!noLimits && pageCount > 100) {
            throw new Error(exports.PDF_EXCEEDS_MAX_PAGE_LIMIT);
        }
        const imagePaths = yield Promise.all(Array.from({ length: pageCount }, (_, i) => (0, convertPage_1.convertPage)(pdfPath, i + 1, pageCount)));
        return (0, combineIntoHTML_1.combineIntoHTML)(imagePaths, title);
    });
}
//# sourceMappingURL=convertPDFToImages.js.map