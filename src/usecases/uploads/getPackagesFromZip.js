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
exports.getPackagesFromZip = void 0;
const zip_1 = require("../../lib/zip/zip");
const PrepareDeck_1 = require("../../infrastracture/adapters/fileConversion/PrepareDeck");
const Package_1 = __importDefault(require("../../lib/parser/Package"));
const checkFlashcardsLimits_1 = require("../../lib/User/checkFlashcardsLimits");
const getMaxUploadCount_1 = require("../../lib/misc/getMaxUploadCount");
const isZipContentFileSupported_1 = require("./isZipContentFileSupported");
const getPackagesFromZip = (fileContents, paying, settings, workspace) => __awaiter(void 0, void 0, void 0, function* () {
    const zipHandler = new zip_1.ZipHandler((0, getMaxUploadCount_1.getMaxUploadCount)(paying));
    const packages = [];
    if (!fileContents) {
        return { packages: [] };
    }
    yield zipHandler.build(fileContents, paying, settings);
    const fileNames = zipHandler.getFileNames();
    let cardCount = 0;
    for (const fileName of fileNames) {
        if ((0, isZipContentFileSupported_1.isZipContentFileSupported)(fileName)) {
            const deck = yield (0, PrepareDeck_1.PrepareDeck)({
                name: fileName,
                files: zipHandler.files,
                settings,
                noLimits: paying,
                workspace,
            });
            if (deck) {
                packages.push(new Package_1.default(deck.name));
                cardCount += deck.deck.reduce((acc, d) => acc + d.cards.length, 0);
                // Checking the limit in place while iterating through the decks
                (0, checkFlashcardsLimits_1.checkFlashcardsLimits)({
                    cards: 0,
                    decks: deck.deck,
                    paying,
                });
            }
        }
        // Checking the limit in place while iterating through the files
        (0, checkFlashcardsLimits_1.checkFlashcardsLimits)({
            cards: cardCount,
            paying: paying,
        });
    }
    return { packages };
});
exports.getPackagesFromZip = getPackagesFromZip;
//# sourceMappingURL=getPackagesFromZip.js.map