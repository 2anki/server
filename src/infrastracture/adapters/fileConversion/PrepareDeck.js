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
exports.PrepareDeck = PrepareDeck;
const getDeckFilename_1 = __importDefault(require("../../../lib/anki/getDeckFilename"));
const DeckParser_1 = require("../../../lib/parser/DeckParser");
const checks_1 = require("../../../lib/storage/checks");
const convertPDFToHTML_1 = require("./convertPDFToHTML");
const ConvertPPTToPDF_1 = require("./ConvertPPTToPDF");
const convertImageToHTML_1 = require("./convertImageToHTML");
const convertPDFToImages_1 = require("./convertPDFToImages");
const convertXLSXToHTML_1 = require("./convertXLSXToHTML");
function PrepareDeck(input) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const convertedFiles = [];
        for (const file of input.files) {
            if (!file.contents) {
                continue;
            }
            if ((0, checks_1.isXLSXFile)(file.name)) {
                const htmlContent = (0, convertXLSXToHTML_1.convertXLSXToHTML)(file.contents, file.name);
                convertedFiles.push({
                    name: `${file.name}.html`,
                    contents: Buffer.from(htmlContent),
                });
                continue;
            }
            if ((0, checks_1.isImageFile)(file.name) &&
                input.settings.imageQuizHtmlToAnki &&
                input.noLimits) {
                const convertedImageContents = yield (0, convertImageToHTML_1.convertImageToHTML)((_a = file.contents) === null || _a === void 0 ? void 0 : _a.toString('base64'));
                convertedFiles.push({
                    name: `${file.name}.html`,
                    contents: convertedImageContents,
                });
            }
            if (!(0, checks_1.isPDFFile)(file.name) && !(0, checks_1.isPPTFile)(file.name))
                continue;
            if ((0, checks_1.isPDFFile)(file.name) &&
                input.noLimits &&
                input.settings.vertexAIPDFQuestions &&
                input.settings.processPDFs !== false) {
                const htmlContent = yield (0, convertPDFToHTML_1.convertPDFToHTML)(file.contents.toString('base64'), input.settings.userInstructions);
                convertedFiles.push({
                    name: `${file.name}.html`,
                    contents: Buffer.from(htmlContent),
                });
            }
            else if ((0, checks_1.isPPTFile)(file.name)) {
                const pdContents = yield (0, ConvertPPTToPDF_1.convertPPTToPDF)(file.name, file.contents, input.workspace);
                const convertedContents = yield (0, convertPDFToImages_1.convertPDFToImages)({
                    name: file.name,
                    workspace: input.workspace,
                    noLimits: input.noLimits,
                    contents: pdContents,
                    settings: input.settings,
                });
                convertedFiles.push({
                    name: `${file.name}.html`,
                    contents: convertedContents,
                });
            }
            else if ((0, checks_1.isPDFFile)(file.name) && input.settings.processPDFs !== false) {
                const convertedContents = yield (0, convertPDFToImages_1.convertPDFToImages)({
                    name: file.name,
                    workspace: input.workspace,
                    noLimits: input.noLimits,
                    contents: file.contents,
                    settings: input.settings,
                });
                convertedFiles.push({
                    name: `${file.name}.html`,
                    contents: convertedContents,
                });
            }
        }
        input.files.push(...convertedFiles);
        const parser = new DeckParser_1.DeckParser(input);
        if (parser.totalCardCount() === 0) {
            if (convertedFiles.length > 0) {
                const htmlFile = convertedFiles.find((file) => (0, checks_1.isHTMLFile)(file.name));
                parser.processFirstFile((_b = htmlFile === null || htmlFile === void 0 ? void 0 : htmlFile.name) !== null && _b !== void 0 ? _b : input.name);
            }
            else {
                const apkg = yield parser.tryExperimental();
                return {
                    name: (0, getDeckFilename_1.default)((_c = parser.name) !== null && _c !== void 0 ? _c : input.name),
                    apkg,
                    deck: parser.payload,
                };
            }
        }
        const apkg = yield parser.build(input.workspace);
        return {
            name: (0, getDeckFilename_1.default)(parser.name),
            apkg,
            deck: parser.payload,
        };
    });
}
//# sourceMappingURL=PrepareDeck.js.map